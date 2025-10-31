"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { SaveAction } from "@/components/common/saveAction";
import { useDesignContext } from "../../../layout";
import api from "@/utils/api.class";
import Notification from "@/app/components/notification";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, MARKETPLACE_ADDRESS } from "@/utils/constant";
import { LoaderIcon } from "lucide-react";
import { listingABI } from "@/abis/astraABIs";
import { useWallet } from "@/hooks/useWallet"; // Import the hook
import { clearPublishData, getPublishData } from "@/utils/publishStorage";

const parseCurrency = (value: string): number => {
  if (!value) return 0;
  return parseFloat(value.replace(/,/g, "")) || 0;
};

interface PreviewData {
  pricePerOutfit: string;
  quantityAvailable: string;
  deliveryWindow: string;
  brandStory: string;
  regionOfDelivery: string;
}

export default function PreviewScreenPage() {
  const { design, loading } = useDesignContext();
  const router = useRouter();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [ownedTokenIds, setOwnedTokenIds] = useState<number[]>([]);
  const [overlay, setOverlay] = useState({ visible: false, message: "" });
  const [loadingNFTs, setLoadingNFTs] = useState(true);

  // Use centralized wallet hook
  const {
    provider,
    signer,
    address: userAddress,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    loading: walletLoading,
  } = useWallet(); // autoConnect: true

  // Fetch owned NFTs for this design
  // Add loading state

  // Replace entire useEffect
  useEffect(() => {
    async function fetchOwnedNFTs() {
      if (!provider || !isCorrectNetwork || !userAddress || !design?.id) {
        setOwnedTokenIds([]);
        setLoadingNFTs(false);
        return;
      }

      setLoadingNFTs(true);
      try {
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          listingABI,
          provider
        );

        // 1. Get ALL token IDs owned by user
        const tokenIdsBN = await contract.tokensOfOwner(userAddress);
        const tokenIds = tokenIdsBN.map((id: ethers.BigNumber) =>
          id.toNumber()
        );

        if (tokenIds.length === 0) {
          setOwnedTokenIds([]);
          setLoadingNFTs(false);
          return;
        }

        // 2. Batch fetch designId for ALL tokens
        const designIdPromises = tokenIds.map(
          (tokenId) => contract.getDesignId(tokenId).catch(() => null) // ignore errors
        );
        const designIds = await Promise.all(designIdPromises);

        // 3. Filter tokens that match current design.id
        const designTokenIds = tokenIds.filter(
          (_, i) => designIds[i] === design.id
        );

        setOwnedTokenIds(designTokenIds);
        console.log("Owned NFTs for design", design.id, ":", designTokenIds);
      } catch (error) {
        console.error("Failed to fetch NFTs:", error);
        Notification.error("Failed to load your NFTs.");
        setOwnedTokenIds([]);
      } finally {
        setLoadingNFTs(false);
      }
    }

    fetchOwnedNFTs();
  }, [provider, userAddress, design?.id, isCorrectNetwork]);

  // Load preview data
  useEffect(() => {
    const step1Data = getPublishData(design.id, "step1");
    const step2Data = getPublishData(design.id, "step2");

    if (!step1Data || !step2Data) {
      router.push(`/dashboard/publish/${design?.id}`);
      return;
    }

    setPreviewData({ ...step1Data, ...step2Data });
    console.log("Preview - Loaded data:", { step1Data, step2Data });
  }, [design?.id, router]);

  if (loading || !design || !previewData) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  const handlePublishNow = async () => {
    if (!isConnected || !provider || !signer || !userAddress) {
      await connectWallet();
      return;
    }

    setIsPublishing(true);
    setOverlay({ visible: true, message: "Preparing transaction..." });

    try {
      const quantity = parseInt(previewData.quantityAvailable, 10);
      const price = Math.round(
        parseCurrency(previewData.pricePerOutfit) * 1_000_000
      ).toString();

      if (quantity > design.quantity) {
        throw new Error(`Quantity exceeds minted amount (${design.quantity}).`);
      }

      if (ownedTokenIds.length === 0) {
        throw new Error("You don't own any NFTs for this design.");
      }

      // Sign confirmation message
      setOverlay({ visible: true, message: "Awaiting signature..." });
      const message = `Publish ${quantity} NFTs for design ${design.id} at ${price} USDC to marketplace`;
      const signature = await signer.signMessage(message);
      console.log("Preview - Signature:", signature);

      // Transfer NFTs to marketplace
      setOverlay({ visible: true, message: "Processing NFT transfer..." });
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        listingABI,
        signer
      );
      const tokenIdsToTransfer = ownedTokenIds.slice(0, quantity);
      console.log("Preview - Transferring NFTs:", tokenIdsToTransfer);

      for (const tokenId of tokenIdsToTransfer) {
        const transferTx = await contract.transferNFT(
          MARKETPLACE_ADDRESS,
          tokenId
        );
        const receipt = await transferTx.wait();
        console.log(
          `Preview - NFT ${tokenId} transferred:`,
          receipt.transactionHash
        );
      }

      // Batch list NFTs
      setOverlay({ visible: true, message: "Listing NFTs..." });
      const listingResponse = await api.batchListNFTs({ quantity, price });

      if (!listingResponse.status) {
        throw new Error(listingResponse.message || "Failed to list NFTs");
      }

      // Publish to marketplace
      setOverlay({ visible: true, message: "Publishing to marketplace..." });
      const publishData = {
        designId: design.id,
        pricePerOutfit: parseCurrency(previewData.pricePerOutfit),
        quantityAvailable: quantity,
        deliveryWindow: previewData.deliveryWindow,
        brandStory: previewData.brandStory,
        regionOfDelivery: previewData.regionOfDelivery,
      };
      const publishResponse = await api.publishToMarketplace(publishData);

      if (!publishResponse.status) {
        throw new Error(
          publishResponse.message || "Failed to publish to marketplace"
        );
      }

      clearPublishData(design.id);
      setOverlay({ visible: true, message: "Completed successfully!" });
      Notification.success("Design published successfully!");

      setTimeout(() => {
        setOverlay({ visible: false, message: "" });
        router.replace("/dashboard");
      }, 1200);
    } catch (error) {
      // const message = error.message || "Error publishing to marketplace.";
      setOverlay({ visible: false, message: "" });
      router.replace("/dashboard");
      clearPublishData(design.id);
      // Notification.error(message);
      console.error("Preview - Publish failed:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const displayPrice = parseCurrency(previewData.pricePerOutfit).toFixed(2);
  const displayQuantity = previewData.quantityAvailable;

  return (
    <>
      {/* Overlay */}
      {overlay.visible && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50'>
          <div className='bg-[#0e0e0e] px-8 py-4 rounded-xl shadow-lg text-center space-y-2'>
            <LoaderIcon className='w-5 h-5 animate-spin text-gray-400 mx-auto' />
            <p className='text-sm font-medium text-white/80'>
              {overlay.message}
            </p>
          </div>
        </div>
      )}

      <div className='w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6 py-8 md:px-[50px] flex flex-col items-center'>
        <h1 className='text-2xl font-bold mb-2 text-center'>Preview Screen</h1>
        <p className='text-gray-600 mb-8 text-center'>
          Here&apos;s how your design will look in the marketplace.
        </p>

        <div className='w-full bg-white rounded-xl overflow-hidden'>
          <div className='flex flex-col gap-5 md:flex-row md:items-stretch mb-8'>
            <div className='md:w-1/2 flex'>
              <div className='flex-1 rounded-lg overflow-hidden bg-gray-100'>
                <Image
                  src={design.designLink}
                  alt={`${design.name} Design`}
                  width={600}
                  height={800}
                  className='object-cover object-top w-full h-full rounded-2xl'
                />
              </div>
            </div>

            <div className='md:w-1/2 p-6 space-y-3 border border-primary/40 rounded-2xl'>
              <div>
                <h2 className='text-xl font-bold'>{design.name}</h2>
                <p className='text-sm text-muted-foreground'>By Creator</p>
                <div className='text-xl font-bold mt-3 flex items-center gap-1'>
                  <Image
                    src='/USDC.svg'
                    alt='USDC logo'
                    width={20}
                    height={20}
                  />
                  ${displayPrice}
                </div>
              </div>

              <p className='text-sm text-muted-foreground leading-relaxed'>
                {previewData.brandStory}
              </p>

              <div className='mb-6 space-y-2'>
                <p className='text-sm font-semibold text-primary/90'>
                  Lead Time
                </p>
                <div className='inline-block bg-gray-100 border border-gray-300 text-gray-800 px-4 py-2 rounded-full text-xs'>
                  Made to order: {previewData.deliveryWindow}
                </div>
              </div>

              <div className='mb-6 space-y-2'>
                <p className='text-sm font-semibold text-primary/90'>
                  Listing Quantity
                </p>
                <div className='bg-gray-100 border border-gray-300 text-gray-800 px-4 py-2 rounded-full text-xs flex items-center gap-2'>
                  <div className='bg-gray-100 border border-gray-300 text-gray-800 px-4 py-2 rounded-full text-xs flex items-center gap-2'>
                    <span className='flex items-center gap-2'>
                      {displayQuantity} pieces{" "}
                      {loadingNFTs ? (
                        <span className='inline-block w-8 h-3 bg-gray-300 rounded animate-pulse' />
                      ) : ownedTokenIds.length > 0 ? (
                        `Owned: ${ownedTokenIds.length}`
                      ) : (
                        "Owned: 0"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex items-start gap-8'>
                <div className='space-y-2'>
                  <p className='text-sm font-semibold text-primary/90'>
                    Ships to
                  </p>
                  <div className='inline-block bg-gray-100 text-gray-800 px-4 py-1 rounded-full text-sm border border-gray-300'>
                    {previewData.regionOfDelivery}
                  </div>
                </div>
              </div>

              <div className='bg-gray-100 p-4 rounded-lg text-sm space-y-3 text-gray-600 border border-gray-300'>
                <div className='flex items-center space-x-2'>
                  <Image
                    src='/innovation_starIcon.png'
                    alt='Star icon representing innovation'
                    width={22}
                    height={22}
                    className='h-[22px] w-auto'
                  />
                  <span className='font-semibold'>Astra Escrow</span>
                </div>
                <p>
                  All funds from items purchased will remain in escrow until
                  clothing is delivered.
                </p>
              </div>
            </div>
          </div>

          <div className='w-full flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <div
              onClick={(e) => {
                if (
                  isPublishing ||
                  walletLoading ||
                  !isConnected ||
                  ownedTokenIds.length === 0
                ) {
                  e.stopPropagation();
                }
              }}
              className='flex-1'>
              <SaveAction
                onConfirm={handlePublishNow}
                successMessage='Listed'
                confirmTitle='Sell on the Marketplace?'
                confirmDescription={`This will publish "${design.name}" at $${displayPrice} with ${displayQuantity} pieces available.`}>
                <Button
                  className='w-full px-8 bg-black hover:bg-gray-800 text-white font-medium rounded-lg h-12 text-base transition-colors duration-200'
                  disabled={
                    isPublishing ||
                    walletLoading ||
                    !isConnected ||
                    loadingNFTs ||
                    ownedTokenIds.length === 0
                  }>
                  {isPublishing
                    ? "Publishing..."
                    : walletLoading
                      ? "Connecting..."
                      : "Publish Now"}
                </Button>
              </SaveAction>
            </div>

            <Button
              onClick={() => router.back()}
              variant='outline'
              className='w-full max-w-xs px-8 border-gray-300 text-gray-700 hover:opacity-70 font-medium rounded-lg h-12 text-base transition-colors duration-200'
              disabled={isPublishing || walletLoading}>
              Edit Details
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
