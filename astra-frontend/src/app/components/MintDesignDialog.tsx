"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LoaderIcon, Minus, Plus } from "lucide-react";
import { ethers } from "ethers";
import api from "@/utils/api.class";
import {
  CONTRACT_ADDRESS,
  TOKEN_SERVICE_ADDRESS,
  TREASURY_ADDRESS,
  USDC_ADDRESS,
} from "@/utils/constant";
import { contractABI, tokenServiceABI } from "@/abis/astraABIs";
import { useWallet } from "@/hooks/useWallet"; // Import the hook

type Props = {
  chatId: string;
  selectedVariation: string;
  selectedImageUrl: string;
  mintKey: string;
  onMintSuccess?: () => void;
};

export default function MintDesignDialog({
  chatId,
  selectedVariation,
  selectedImageUrl,
  mintKey,
  onMintSuccess,
}: Props) {
  const [designName, setDesignName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [overlay, setOverlay] = useState({ visible: false, message: "" });
  const [open, setOpen] = useState(false);
  const [totalFee, setTotalFee] = useState<string>("0");
  const [baseMintFee, setBaseMintFee] = useState<ethers.BigNumber | null>(null);

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

  // Fetch the baseFee
  useEffect(() => {
    if (!provider || !isCorrectNetwork) {
      setBaseMintFee(null);
      return;
    }

    (async () => {
      try {
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI,
          provider
        );
        const fee = await contract.getBaseMintFee();
        setBaseMintFee(fee);
      } catch (error) {
        console.error("Failed to fetch base fee:", error);
        toast.error("Failed to load mint fee.");
      }
    })();
  }, [provider, isCorrectNetwork]);

  // Update total instantly when quantity changes
  useEffect(() => {
    if (baseMintFee) {
      const total = baseMintFee.mul(quantity);
      setTotalFee(ethers.utils.formatUnits(total, 6));
    } else {
      setTotalFee("0");
    }
  }, [quantity, baseMintFee]);

  const handleMint = async () => {
    if (!isConnected || !provider || !signer || !userAddress) {
      await connectWallet();
      return;
    }

    if (designName.length < 3) {
      toast.error("Design name must be at least 3 characters.");
      return;
    }

    setLoading(true);
    setOpen(false);
    setOverlay({ visible: true, message: "Preparing transaction..." });

    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        provider
      );
      const tokenService = new ethers.Contract(
        TOKEN_SERVICE_ADDRESS,
        tokenServiceABI,
        signer
      );

      const maxPerMint = await contract.MAX_PER_MINT();
      if (quantity > maxPerMint.toNumber()) {
        throw new Error(
          `Quantity exceeds max per mint (${maxPerMint.toNumber()}).`
        );
      }

      // Associate USDC
      try {
        const assocTx = await tokenService.associateTokens(userAddress, [
          USDC_ADDRESS,
        ]);
        await assocTx.wait();
        console.log("USDC associated.");
      } catch (error) {
        console.warn("USDC association may already exist:", error);
      }

      // Calculate fee
      const baseMintFee = await contract.getBaseMintFee();
      const totalFeeRaw = baseMintFee.mul(quantity);

      // Check balance
      const usdc = new ethers.Contract(
        USDC_ADDRESS,
        ["function balanceOf(address) view returns (uint256)"],
        provider
      );
      const balance = await usdc.balanceOf(userAddress);
      if (balance.lt(totalFeeRaw)) {
        throw new Error("Insufficient USDC balance.");
      }

      // Transfer USDC
      setOverlay({ visible: true, message: "Processing USDC payment..." });
      const transferTx = await tokenService.transferToken(
        USDC_ADDRESS,
        userAddress,
        TREASURY_ADDRESS,
        totalFeeRaw
      );
      const receipt = await transferTx.wait();
      const txHash = receipt.transactionHash;

      // Notify backend
      setOverlay({ visible: true, message: "Minting your design..." });
      const mintPayload = {
        chatId,
        selectedVariation,
        paymentTransactionHash: txHash,
        name: designName,
        quantity: Number(quantity),
        recipientAddress: userAddress,
      };
      console.log("Mint API payload:", JSON.stringify(mintPayload));
      const mintResponse = await api.mintNFT(mintPayload);

      if (mintResponse?.status) {
        toast.success("Design minted successfully!");
        localStorage.setItem(mintKey, "true");
        onMintSuccess?.();
      } else {
        throw new Error(mintResponse?.message || "Minting failed");
      }

      setOverlay({ visible: false, message: "" });
      setOpen(false);
    } catch (error) {
      console.error("Mint failed:", error);
      toast.error(error.message || "Transaction failed");
      setOpen(true);
      setOverlay({ visible: false, message: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='relative flex flex-col items-center gap-2'>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size='lg'
            className='bg-[radial-gradient(circle_at_center,_#f2f2f2_10%,_#DBDBDB_90%)] hover:opacity-75 font-bold text-blue-700 rounded-lg'>
            Pay to hire a maker
          </Button>
        </DialogTrigger>

        <DialogContent className='w-[95%] md:max-w-md p-0 overflow-hidden border-none bg-zinc-900 text-white'>
          <DialogTitle></DialogTitle>
          <div className='flex flex-col'>
            <Image
              src={selectedImageUrl}
              alt={selectedVariation}
              width={800}
              height={400}
              className='w-full h-52 object-cover object-top'
            />

            <div className='p-6 space-y-5'>
              <div>
                <Label className='text-sm text-zinc-300 mb-2 block'>
                  Design Name
                </Label>
                <Input
                  type='text'
                  placeholder='e.g. Eterna Majesté'
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  className='bg-zinc-800 border-zinc-700 text-white'
                />
              </div>

              <div>
                <Label className='text-sm text-zinc-300 mb-2 block'>
                  Quantity
                </Label>
                <div className='flex items-center gap-2'>
                  <Button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    variant='outline'
                    className='bg-white/80 text-gray-600'
                    size='icon'>
                    <Minus className='w-4 h-4' />
                  </Button>
                  <Input
                    type='number'
                    min='1'
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className='bg-zinc-800 border-zinc-700 text-center w-20 text-white'
                  />
                  <Button
                    onClick={() => setQuantity(quantity + 1)}
                    variant='outline'
                    className='bg-white/80 text-gray-600'
                    size='icon'>
                    <Plus className='w-4 h-4' />
                  </Button>
                </div>
              </div>

              <div className='flex items-center justify-between border-b border-zinc-800 pb-2'>
                <span className='text-xl font-bold'>{totalFee} USDC</span>
                <span className='text-sm text-zinc-400'>One-time payment</span>
              </div>

              <Button
                onClick={handleMint}
                disabled={
                  designName.length < 3 ||
                  loading ||
                  walletLoading ||
                  !isConnected ||
                  totalFee === "0"
                }
                className='w-full bg-white text-black hover:bg-white/70 hover:text-white font-semibold flex justify-center items-center gap-2'>
                {loading ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : walletLoading ? (
                  "Connecting..."
                ) : (
                  `Mint · ${totalFee} USDC`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
