"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/utils/api.class";
import { Loader2, LoaderIcon, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Label } from "@/components/ui/label";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  TOKEN_SERVICE_ADDRESS,
  TREASURY_ADDRESS,
  USDC_ADDRESS,
} from "@/utils/constant";
import { contractABI, tokenServiceABI } from "@/abis/astraABIs";
import { useWallet } from "@/hooks/useWallet"; // Import the hook
import WalletConnectButton from "../aiagent/component/ConnectButton";

interface CreateDesignDialogProps {
  setOpen: (open: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrl: string | null;
  description: string;
  file: File | null;
}

export default function CreateDesignDialog({
  setOpen,
  open,
  onOpenChange,
  previewUrl,
  description,
  file,
}: CreateDesignDialogProps) {
  const router = useRouter();
  const [designName, setDesignName] = useState("");
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(1);
  const [overlay, setOverlay] = useState({ visible: false, message: "" });
  const [totalFee, setTotalFee] = useState<string>("0");
  const [baseMintFee, setBaseMintFee] = useState<ethers.BigNumber | null>(null);

  // Using a centralized wallet hook
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
      const total = baseMintFee.mul(value);
      setTotalFee(ethers.utils.formatUnits(total, 6));
    } else {
      setTotalFee("0");
    }
  }, [value, baseMintFee]);

  const handleMint = async () => {
    if (!isConnected || !provider || !signer || !userAddress) {
      await connectWallet();
      return;
    }

    if (designName.length < 3) {
      toast.error("Design name must be at least 3 characters.");
      return;
    }

    if (!file) {
      toast.error("No file available for upload.");
      return;
    }

    setLoading(true);
    setOpen(false);
    setOverlay({ visible: true, message: "Preparing transaction..." });

    try {
      // Validate max per mint
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        provider
      );
      const maxPerMint = await contract.MAX_PER_MINT();
      if (value > maxPerMint.toNumber()) {
        throw new Error(
          `Quantity exceeds max per mint (${maxPerMint.toNumber()}).`
        );
      }

      // Associate USDC
      const tokenService = new ethers.Contract(
        TOKEN_SERVICE_ADDRESS,
        tokenServiceABI,
        signer
      );
      try {
        const assocTx = await tokenService.associateTokens(userAddress, [
          USDC_ADDRESS,
        ]);
        await assocTx.wait();
        console.log("USDC associated.");
      } catch (error) {
        console.warn("USDC may already be associated:", error);
      }

      // Calculate fee
      const baseMintFee = await contract.getBaseMintFee();
      const totalFeeRaw = baseMintFee.mul(value);

      // Check USDC balance
      const usdcContract = new ethers.Contract(
        USDC_ADDRESS,
        ["function balanceOf(address) view returns (uint256)"],
        provider
      );
      const balance = await usdcContract.balanceOf(userAddress);
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
      const paymentTransactionHash = receipt.transactionHash;
      console.log("Payment tx hash:", paymentTransactionHash);

      const payload = {
        image: file,
        description,
      };

      // Upload design
      setOverlay({ visible: true, message: "Uploading your design..." });
      console.log("Image Upload Request: ", payload);

      const uploadResponse = await api.uploadDesignDirectly({
        image: file,
        description,
      });

      console.log("Image Upload Response: ", uploadResponse);

      if (!uploadResponse?.status) {
        throw new Error(uploadResponse?.message || "Upload failed");
      }

      // Mint NFTs
      setOverlay({ visible: true, message: "Minting your NFTs..." });
      const mintPayload = {
        paymentTransactionHash,
        name: designName,
        designId: uploadResponse.data.designId,
        quantity: Number(value),
        recipientAddress: userAddress,
      };
      const mintResponse = await api.mintNFT(mintPayload);

      if (mintResponse?.status) {
        setOverlay({ visible: true, message: "Completed successfully!" });
        toast.success("Design minted successfully!");
        setTimeout(() => {
          setOverlay({ visible: false, message: "" });
          router.push("/dashboard/design");
        }, 1200);
      } else {
        throw new Error(mintResponse?.message || "Minting failed");
      }

      setOpen(false);
    } catch (error) {
      setOverlay({ visible: false, message: "" });
      setOpen(true);
      toast.error(`Error: ${error.message || "Transaction failed"}`);
      console.error("Minting failed:", error);
    } finally {
      setLoading(false);
    }
  };

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

      <div className='px-3 md:px-0 w-full max-w-lg'>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent
            className='max-h-[85vh] w-[95%] md:w-full overflow-hidden p-0 flex flex-col overflow-y-auto rounded-md sm:rounded-lg'
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(120,120,120,0.3) transparent",
              WebkitOverflowScrolling: "touch",
            }}>
            <DialogTitle></DialogTitle>
            <div style={{ scrollbarWidth: "thin" }}>
              {previewUrl && (
                <div className='p-0'>
                  <AspectRatio ratio={16 / 6}>
                    <Image
                      src={previewUrl}
                      alt='Design Preview'
                      fill
                      className='rounded-t-md object-cover'
                      priority
                    />
                  </AspectRatio>
                </div>
              )}

              <div className='flex-1 space-y-6 px-4 sm:px-6 pt-3 pb-2'>
                <DialogHeader>
                  <DialogTitle>Create Your Design</DialogTitle>
                  <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='design_name'>Design Name</Label>
                    <Input
                      type='text'
                      value={designName}
                      onChange={(e) => setDesignName(e.target.value)}
                      placeholder='Name Your Design'
                    />
                    <p className='mt-1 text-xs text-muted-foreground font-medium italic'>
                      Use a short, descriptive name (e.g., ‘Golden Horizon’)
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='quantity'>Quantity</Label>
                    <div className='flex gap-2'>
                      <Button
                        onClick={() => setValue(Math.max(1, value - 1))}
                        size='icon'
                        type='button'
                        variant='outline'>
                        <Minus className='h-4 w-4' />
                      </Button>
                      <Input
                        className='bg-background text-center'
                        id='quantity'
                        min='1'
                        onChange={(e) => setValue(Number(e.target.value))}
                        type='number'
                        value={value}
                      />
                      <Button
                        onClick={() => setValue(value + 1)}
                        size='icon'
                        type='button'
                        variant='outline'>
                        <Plus className='h-4 w-4' />
                      </Button>
                    </div>
                    <p className='mt-1 text-xs text-muted-foreground font-medium italic'>
                      Decide how many editions of your design to create
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className='border-t bg-background px-4 sm:px-6 py-4'>
              <DialogClose asChild>
                <Button type='button' variant='ghost'>
                  Cancel
                </Button>
              </DialogClose>

              {!isConnected ? (
                <WalletConnectButton />
              ) : (
                <Button
                  className='bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
                  size='lg'
                  onClick={handleMint}
                  disabled={
                    designName.length < 3 ||
                    loading ||
                    walletLoading ||
                    !isConnected ||
                    totalFee === "0"
                  }>
                  {loading ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : walletLoading ? (
                    "Connecting..."
                  ) : (
                    `Mint · ${totalFee} USDC`
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
