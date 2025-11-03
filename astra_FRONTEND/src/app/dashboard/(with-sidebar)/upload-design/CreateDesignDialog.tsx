"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";
import api from "@/utils/api.class";
import MintButton from "../aiagent/component/MintButton";

interface CreateDesignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrl: string | null;
  description: string;
  file: File | null;
}

export default function CreateDesignDialog({
  open,
  onOpenChange,
  previewUrl,
  description,
  file,
}: CreateDesignDialogProps) {
  const router = useRouter();
  const account = useActiveAccount();
  const [designName, setDesignName] = useState("");
  const [loading, setLoading] = useState(false);

  const TESTNET_RECIPIENT = "0xA9A6282B536e5494E884fD6A0bD17AbdE6478670";
  const PAYMENT_AMOUNT = "0.000003";

  const waitForReceipt = async (txHash: string) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return await provider.waitForTransaction(txHash);
  };

  const notifyBackend = async (txHash: string, designId: string) => {
    const payload = {
      paymentTransactionHash: txHash,
      name: designName,
      designId,
    };

    try {
      const data = await api.mintNFT(payload);
      return data;
    } catch (err) {
      console.error("❌ Backend notification error:", err.message);
      toast.error("Backend notification failed: " + err.message);
      throw err;
    }
  };

  const handlePay = async () => {
    if (!account || !window.ethereum) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!designName.trim()) {
      toast.error("Please enter a design name");
      return;
    }

    if (!file) {
      toast.error("No file available for upload");
      return;
    }

    setLoading(true);

    try {
      const value = ethers.utils.parseEther(PAYMENT_AMOUNT).toHexString();

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account.address,
            to: TESTNET_RECIPIENT,
            value,
            gas: "0x5208",
          },
        ],
      });

      const receipt = await waitForReceipt(txHash);
      if (receipt.status === 1) {
        const uploadResponse = await api.uploadDesignDirectly({
          image: file, // Use the original file
          description,
        });

        console.log("Upload Design response: ", uploadResponse);

        if (uploadResponse?.status) {
          await notifyBackend(txHash, uploadResponse.data.designId);
          toast.success("Design minted and uploaded successfully!");
          router.push("/dashboard/design");
        } else {
          toast.error("Upload failed: " + uploadResponse?.message);
        }
      } else {
        toast.error(`❌ Transaction failed: ${txHash}`);
      }
    } catch (err) {
      console.error("Payment or upload error:", err);
      toast.error(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg p-6'>
        {previewUrl && (
          <div className='w-full h-[300px]'>
            <img
              src={previewUrl}
              alt='Design Preview'
              className='w-full h-full rounded-lg mb-4 object-cover object-top'
            />
          </div>
        )}
        <DialogHeader>
          <DialogTitle className='text-xl font-bold text-center'>
            Name Your Design
          </DialogTitle>
          <DialogDescription className='text-center text-gray-500'>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className='mt-5'>
          <Input
            type='text'
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            placeholder='Name Your Design'
            className='w-full p-[10px] border rounded-lg'
          />
        </div>

        {!account && (
          <p className='text-red-500 text-sm bg-red-100 border border-red-200 p-3 rounded-xl'>
            Please connect your wallet before proceeding!
          </p>
        )}

        <DialogFooter className='mt-6 flex justify-end items-center space-x-4'>
          <Button
            size='lg'
            variant='outline'
            onClick={() => onOpenChange(false)}>
            Go Back
          </Button>

          {!account ? (
            <MintButton />
          ) : (
            <Button
              className='bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
              size='lg'
              onClick={handlePay}
              disabled={!account || !designName.trim() || loading}>
              {loading ? "Processing" : `Pay ${PAYMENT_AMOUNT} ETH`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
