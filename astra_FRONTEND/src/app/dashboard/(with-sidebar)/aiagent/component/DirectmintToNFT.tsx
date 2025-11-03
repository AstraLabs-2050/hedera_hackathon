"use client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { BuyWidget } from "thirdweb/react";
import { base } from "thirdweb/chains";
import { ethers } from "ethers";
import { client } from "@/client";
import toast from "react-hot-toast";
import Image from "next/image";
import MintButton from "./MintButton";
import api from "@/utils/api.class";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  chatId: string;
  selectedVariation: string;
  selectedImageUrl: string;
  contractAddress: string;
  isProd?: boolean;
  mintKey: string;
  onMintSuccess?: () => void;
};

type MintState = "idle" | "processing" | "success" | "completed";

export default function DirectMintToNFT({
  chatId,
  selectedVariation,
  selectedImageUrl,
  contractAddress,
  isProd = false,
  mintKey,
  onMintSuccess,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [showBuyWidget, setShowBuyWidget] = useState(false);
  const [mintState, setMintState] = useState<MintState>("idle");
  const [designName, setDesignName] = useState("");
  const account = useActiveAccount();

  const TESTNET_RECIPIENT = "0xA9A6282B536e5494E884fD6A0bD17AbdE6478670";

  // Check if already minted on component mount
  useEffect(() => {
    const mintStatus = localStorage.getItem(mintKey);
    if (mintStatus === "true") {
      setMintState("completed");
    }
  }, [mintKey]);

  const waitForReceipt = async (txHash: string) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return await provider.waitForTransaction(txHash);
  };

  const notifyBackend = async (txHash: string) => {
    const payload = {
      chatId: chatId,
      selectedVariation,
      paymentTransactionHash: txHash,
      name: designName,
    };

    try {
      const data = await api.mintNFT(payload);
      return data;
    } catch (err) {
      console.error("❌ Backend error:", err.message);
      toast.error("Backend error: " + err.message);
      throw err;
    }
  };

  const handleMintSuccess = () => {
    console.log("Mint successful, showing success modal");
    localStorage.setItem(mintKey, "true");
    setShowModal(false);
    setShowBuyWidget(false);
    setMintState("success");

    // Notify parent component
    if (onMintSuccess) {
      onMintSuccess();
    }
  };

  const handlePaymentSuccess = async () => {
    setMintState("processing");
    try {
      const fakeHash = "universal-pay-success";
      await notifyBackend(fakeHash);
      handleMintSuccess();
    } catch (err: any) {
      toast.error("Error: " + err.message);
      setMintState("idle");
    }
  };

  const handleDirectPayment = async () => {
    if (!account || !window.ethereum) {
      toast.error("⚠️ Please connect your wallet first");
      return;
    }

    setMintState("processing");
    try {
      const value = ethers.utils.parseEther("0.000003").toHexString();

      const txHash: string = await window.ethereum.request({
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
        await notifyBackend(txHash);
        handleMintSuccess();
      } else {
        toast.error(`❌ Transaction failed: ${txHash}`);
        setMintState("idle");
      }
    } catch (err: any) {
      console.error("Direct payment error:", err);
      toast.error(`❌ Payment failed: ${err.message}`);
      setMintState("idle");
    }
  };

  const handlePayment = () => {
    isProd ? setShowBuyWidget(true) : handleDirectPayment();
  };

  const handleCloseSuccessModal = () => {
    setMintState("completed");
  };

  // Don't render anything if completely done
  if (mintState === "completed") {
    return null;
  }

  return (
    <div className='flex flex-col items-center gap-2'>
      {mintState === "idle" && (
        <button
          onClick={() => setShowModal(true)}
          className='px-6 py-2 bg-black text-white rounded-lg font-medium'>
          Pay to find a maker
        </button>
      )}

      {mintState === "processing" && (
        <button
          disabled
          className='px-6 py-2 bg-black text-white rounded-lg font-medium opacity-50'>
          Processing...
        </button>
      )}

      {showModal && !showBuyWidget && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full relative'>
            <button
              className='absolute top-2 right-2 text-gray-600'
              onClick={() => setShowModal(false)}
              disabled={mintState === "processing"}>
              ✕
            </button>

            <div className='text-center space-y-4 overflow-y-auto'>
              <h3 className='text-sm font-semibold'>Pay to find a maker</h3>
              <Image
                src={selectedImageUrl}
                alt={selectedVariation}
                width={300}
                height={300}
                className='mx-auto rounded-lg border shadow-sm font-[ClashGrotesk-bold]'
              />
              <p className='text-sm text-gray-600'>
                {selectedVariation.charAt(0).toUpperCase() +
                  selectedVariation.slice(1)}
              </p>

              <div className='space-y-2 text-left'>
                <Label htmlFor='designName' className='text-sm font-medium'>
                  Design Name
                </Label>
                <Input
                  id='designName'
                  type='text'
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  placeholder='Enter design name'
                  maxLength={50}
                  required
                />
              </div>

              {!account && (
                <p className='text-red-500 text-sm'>
                  Please connect your wallet first!
                </p>
              )}

              <button
                onClick={handlePayment}
                disabled={
                  !account || mintState === "processing" || !designName.trim()
                }
                className='w-full px-6 py-3 bg-black text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed'>
                {!account ? (
                  <MintButton />
                ) : mintState === "processing" ? (
                  "Processing..."
                ) : (
                  `Pay ${isProd ? "0.003" : "0.000003"} ETH`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBuyWidget && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full relative'>
            <button
              className='absolute top-2 right-2 text-gray-600'
              onClick={() => {
                setShowBuyWidget(false);
                setShowModal(false);
              }}>
              ✕
            </button>
            <div className='text-center space-y-4'>
              <h3 className='text-lg font-semibold'>Universal Pay</h3>
              <BuyWidget
                client={client}
                chain={base}
                amount='0.003'
                onSuccess={handlePaymentSuccess}
                onError={(err: any) =>
                  toast.error("❌ BuyWidget error: " + err.message)
                }
              />
            </div>
          </div>
        </div>
      )}

      {mintState === "success" && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl'>
            <div className='mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-green-100 mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-10 w-10 text-green-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>

            <h3 className='text-lg font-semibold text-gray-800'>
              Your design has been minted!
            </h3>
            <p className='text-gray-600 mt-2'>
              Proceed to the <span className='font-semibold'>Design</span> tab
              to see your minted design.
            </p>

            <button
              onClick={handleCloseSuccessModal}
              className='mt-6 px-6 py-2 bg-black text-white rounded-lg font-medium'>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// "use client";

// declare global {
//   interface Window {
//     ethereum?: any;
//   }
// }

// import { useState, useEffect } from "react";
// import { useActiveAccount } from "thirdweb/react";
// import { BuyWidget } from "thirdweb/react";
// import { base } from "thirdweb/chains";
// import { ethers } from "ethers";
// import { client } from "@/client";
// import toast from "react-hot-toast";
// import Image from "next/image";
// import MintButton from "./MintButton";
// import api from "@/utils/api.class";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { CircleCheck } from "lucide-react";

// type Props = {
//   chatId: string;
//   selectedVariation: string;
//   selectedImageUrl: string;
//   contractAddress: string;
//   isProd?: boolean;
//   mintKey: string;
// };

// export default function DirectMintToNFT({
//   chatId,
//   selectedVariation,
//   selectedImageUrl,
//   contractAddress,
//   isProd = false,
//   mintKey,
// }: Props) {
//   const [showModal, setShowModal] = useState(false);
//   const [showBuyWidget, setShowBuyWidget] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isMinted, setIsMinted] = useState(false);
//   const [designName, setDesignName] = useState("");
//   const account = useActiveAccount();

//   const TESTNET_RECIPIENT = "0xA9A6282B536e5494E884fD6A0bD17AbdE6478670";
//   const BACKEND_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/web3/nft/mint`;

//   const waitForReceipt = async (txHash: string) => {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     return await provider.waitForTransaction(txHash);
//   };

//   const notifyBackend = async (txHash: string) => {
//     const payload = {
//       chatId: chatId,
//       selectedVariation,
//       paymentTransactionHash: txHash,
//       name: designName,
//     };

//     try {
//       const data = await api.mintNFT(payload);
//       return data;
//     } catch (err: any) {
//       console.error("❌ Backend error:", err.message); // Debug
//       toast.error("Backend error: " + err.message);
//       throw err;
//     }
//   };

//   const handlePaymentSuccess = async () => {
//     setIsProcessing(true);
//     try {
//       const fakeHash = "universal-pay-success";
//       await notifyBackend(fakeHash);
//       setShowModal(false);
//       setShowBuyWidget(false);
//       setShowSuccessModal(true); // Show modal first
//     } catch (err: any) {
//       // console.error("Payment success error:", err); // Debug
//       toast.error("Error: " + err.message);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleDirectPayment = async () => {
//     if (!account || !window.ethereum) {
//       toast.error("⚠️ Please connect your wallet first");
//       return;
//     }

//     setIsProcessing(true);
//     try {
//       const value = ethers.utils.parseEther("0.000003").toHexString();

//       const txHash: string = await window.ethereum.request({
//         method: "eth_sendTransaction",
//         params: [
//           {
//             from: account.address,
//             to: TESTNET_RECIPIENT,
//             value,
//             gas: "0x5208",
//           },
//         ],
//       });

//       const receipt = await waitForReceipt(txHash);
//       if (receipt.status === 1) {
//         await notifyBackend(txHash);
//         setShowModal(false);
//         setShowSuccessModal(true);
//         setIsMinted(true);
//         localStorage.setItem(mintKey, "true");
//       } else {
//         toast.error(`❌ Transaction failed: ${txHash}`);
//       }
//     } catch (err: any) {
//       console.error("Direct payment error:", err); // Debug
//       toast.error(`❌ Payment failed: ${err.message}`);
//     } finally {
//       setIsProcessing(false);
//       if (localStorage.getItem(mintKey) === "true") {
//         setIsMinted(true);
//       }
//     }
//   };

//   const handlePayment = () => {
//     isProd ? setShowBuyWidget(true) : handleDirectPayment();
//   };

//   // Debug modal state
//   useEffect(() => {
//     // console.log("showSuccessModal state:", showSuccessModal);
//   }, [showSuccessModal]);

//   return (
//     <div className='flex flex-col items-center gap-2'>
//       {!isMinted && (
//         <>
//           <button
//             onClick={() => setShowModal(true)}
//             disabled={isProcessing}
//             className='px-6 py-2 bg-black text-white rounded-lg font-medium disabled:opacity-50'>
//             {isProcessing ? "Processing..." : "Pay to find a maker"}
//           </button>

//           {showModal && !showBuyWidget && (
//             <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
//               <div className='bg-white rounded-lg p-6 max-w-md w-full relative'>
//                 <button
//                   className='absolute top-2 right-2 text-gray-600'
//                   onClick={() => setShowModal(false)}
//                   disabled={isProcessing}>
//                   ✕
//                 </button>

//                 <div className='text-center space-y-4 overflow-y-auto'>
//                   <h3 className='text-sm font-semibold'>Pay to find a maker</h3>
//                   <Image
//                     src={selectedImageUrl}
//                     alt={selectedVariation}
//                     width={300}
//                     height={300}
//                     className='mx-auto rounded-lg border shadow-sm font-[ClashGrotesk-bold]'
//                   />
//                   <p className='text-sm text-gray-600'>
//                     {selectedVariation.charAt(0).toUpperCase() +
//                       selectedVariation.slice(1)}
//                   </p>

//                   <div className='space-y-2 text-left'>
//                     <Label htmlFor='designName' className='text-sm font-medium'>
//                       Design Name
//                     </Label>
//                     <Input
//                       id='designName'
//                       type='text'
//                       value={designName}
//                       onChange={(e) => setDesignName(e.target.value)}
//                       placeholder='Enter design name'
//                       maxLength={50}
//                       required
//                     />
//                   </div>

//                   {!account && (
//                     <p className='text-red-500 text-sm'>
//                       Please connect your wallet first!
//                     </p>
//                   )}

//                   <button
//                     onClick={handlePayment}
//                     disabled={!account || isProcessing || !designName.trim()}
//                     className='w-full px-6 py-3 bg-black text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed'>
//                     {!account ? (
//                       <MintButton />
//                     ) : isProcessing ? (
//                       "Processing..."
//                     ) : (
//                       `Pay ${isProd ? "0.003" : "0.000003"} ETH`
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {showBuyWidget && (
//             <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
//               <div className='bg-white rounded-lg p-6 max-w-md w-full relative'>
//                 <button
//                   className='absolute top-2 right-2 text-gray-600'
//                   onClick={() => {
//                     setShowBuyWidget(false);
//                     setShowModal(false);
//                   }}>
//                   ✕
//                 </button>
//                 <div className='text-center space-y-4'>
//                   <h3 className='text-lg font-semibold'>Universal Pay</h3>
//                   <BuyWidget
//                     client={client}
//                     chain={base}
//                     amount='0.003'
//                     onSuccess={handlePaymentSuccess}
//                     onError={(err: any) =>
//                       toast.error("❌ BuyWidget error: " + err.message)
//                     }
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {showSuccessModal && isMinted && (
//             <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
//               <div className='bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl'>
//                 <div className='mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-green-100 mb-4'>
//                   <svg
//                     xmlns='http://www.w3.org/2000/svg'
//                     className='h-10 w-10 text-green-600'
//                     fill='none'
//                     viewBox='0 0 24 24'
//                     stroke='currentColor'
//                     strokeWidth={2}>
//                     <path
//                       strokeLinecap='round'
//                       strokeLinejoin='round'
//                       d='M5 13l4 4L19 7'
//                     />
//                   </svg>
//                 </div>

//                 <h3 className='text-lg font-semibold text-gray-800'>
//                   Your design has been minted!
//                 </h3>
//                 <p className='text-gray-600 mt-2'>
//                   Proceed to the <span className='font-semibold'>Design</span>{" "}
//                   tab to see your minted design.
//                 </p>

//                 <button
//                   onClick={() => {
//                     setShowSuccessModal(false);
//                   }}
//                   className='mt-6 px-6 py-2 bg-black text-white rounded-lg font-medium'>
//                   Close
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }
