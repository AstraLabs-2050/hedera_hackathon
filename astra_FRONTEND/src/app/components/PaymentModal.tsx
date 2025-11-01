"use client"
import React, { useState } from "react"
import { useActiveAccount, useSendTransaction } from "thirdweb/react"
import { base, baseSepolia } from "thirdweb/chains"
import Image from "next/image"
import Button from "./button"
import { ASTRA_NFT_ADDRESS, USDC_ADDRESS } from "@/utils/constant"
import { client } from "@/client"
import {
  getContract,
  readContract,
  waitForReceipt,
  prepareTransaction,
  prepareContractCall,
} from "thirdweb"
import { ASTRA_NFT_ABI } from "@/abis/AstraNFT_ABI"
import type { Abi, AbiFunction } from "abitype"
import api from "@/utils/api.class"

// Define full USDC ABI for better interaction
const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
] as const

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  amount: number
  designId: string
  title: string
  imageUrl?: string
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  designId,
  title,
  imageUrl,
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const account = useActiveAccount()

  const { mutateAsync: sendTransaction } = useSendTransaction()
  const nftContract = React.useMemo(() => {
    if (!ASTRA_NFT_ADDRESS) return null
    try {
      return getContract({
        client,
        address: ASTRA_NFT_ADDRESS,
        chain: baseSepolia,
        abi: ASTRA_NFT_ABI as any
      })
    } catch (err) {
      console.error("Error initializing NFT contract:", err)
      return null
    }
  }, [])
  
  const usdcContract = React.useMemo(() => {
    try {
      return getContract({
        client,
        address: USDC_ADDRESS,
        chain: baseSepolia,
        abi: USDC_ABI
      })
    } catch (error) {
      console.error("Failed to initialize USDC contract:", error)
      return null
    }
  }, [])

  const handlePayment = async () => {
    if (!account?.address) {
      setError("Please connect your wallet first")
      return
    }

    if (!nftContract) {
      setError("NFT contract not initialized. Please try again.")
      return
    }

    if (!usdcContract) {
      setError("USDC contract not initialized. Please try again.")
      return
    }

    if (!designId) {
      setError("Design ID is required")
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      try {
        const designResponse = await api.getCollectionById(designId)
        if (designResponse?.data?.creationFeePaid === true) {
          setError("Design minted already")
          setIsProcessing(false)
          return
        }
      } catch (error) {
        console.error("Error checking design status:", error)
        // Continue with minting if we can't verify the status
      }


      // Get decimals first
      const decimals = await readContract({
        contract: usdcContract,
        method: "decimals",
      }).catch(() => 6) // Default to 6 if call fails

      // Check USDC balance
      const balance = await readContract({
        contract: usdcContract,
        method: "balanceOf",
        params: [account.address],
      }).catch((error) => {
        console.warn("USDC balance read returned zero data, setting balance to 0")
        return BigInt(0)
      })


      const balanceInUSDC = Number(balance) / Math.pow(10, decimals)
     

      if (balanceInUSDC < amount) {
        setError(
          `Insufficient USDC balance. You need ${amount} USDC but have ${balanceInUSDC.toFixed(
            2
          )} USDC`
        )
        return
      }      // Check allowance
      const allowance = await readContract({
        contract: usdcContract,
        method: "allowance",
        params: [account.address, ASTRA_NFT_ADDRESS],
      }).catch((error) => {
        console.warn("Allowance read returned zero data, setting allowance to 0")
        return BigInt(0)
      })
      
      const allowanceInUSDC = Number(allowance) / Math.pow(10, decimals)
  

      // Step 1: Approve USDC if needed
      if (allowanceInUSDC < amount) {
        try {
          const amountToApprove = BigInt(amount * Math.pow(10, decimals))
          
          const approveTx = await prepareContractCall({
            contract: usdcContract,
            method: "approve",
            params: [ASTRA_NFT_ADDRESS, amountToApprove]
          })

          const { transactionHash: approveHash } = await sendTransaction(approveTx)
          
          
          const approveReceipt = await waitForReceipt({
            client,
            chain: baseSepolia,
            transactionHash: approveHash
          })
        } catch (error) {
          console.error("Approval error:", error)
          setError("Failed to approve USDC transfer. Please try again.")
          setIsProcessing(false)
          return
        }
      }

      // Verify approval was successful
      const newAllowance = await readContract({
        contract: usdcContract,
        method: "allowance",
        params: [account.address, ASTRA_NFT_ADDRESS]
      })
      
      const newAllowanceInUSDC = Number(newAllowance) / Math.pow(10, decimals)
      

      if (newAllowanceInUSDC < amount) {
        throw new Error("Approval failed - allowance not increased")
      }

      // Step 2: Transfer USDC
      try {
        const amountToTransfer = BigInt(amount * Math.pow(10, decimals))
        
        const transferTx = await prepareContractCall({
          contract: usdcContract,
          method: "transfer",
          params: [ASTRA_NFT_ADDRESS, amountToTransfer]
        })

        const { transactionHash: transferHash } = await sendTransaction(transferTx)
        
        
        const transferReceipt = await waitForReceipt({
          client,
          chain: baseSepolia,
          transactionHash: transferHash
        })
       

        // Step 3: Mint NFT
       
        try {
          const mintTx = await prepareContractCall({
            contract: nftContract,
            method: "mintNFT",
            params: [
              account.address,
              designId,
              title,
              "default",
              imageUrl || "",
              "Generated design",
              imageUrl || ""
            ]
          })

          const { transactionHash: mintHash } = await sendTransaction(mintTx)
         
          
          const mintReceipt = await waitForReceipt({
            client,
            chain: baseSepolia,
            transactionHash: mintHash
          })

          // Update collection status after minting
          try {
            const statusResponse = await api.getCollectionStatus(designId, true)
            
            
            // Verify the status update
            const collection = await api.getCollectionById(designId)
            if (collection?.data?.status === 'published') {
             
            } else {
             
            }
          } catch (error) {
            console.error("Error updating collection status:", error)
            console.error("Status update failed for designId:", designId)
            // Continue even if status update fails
          }

          onSuccess()
        } catch (error) {
          // Check if error is about design already being minted
          const errorMessage = error?.message || String(error)
          if (errorMessage.includes("Design ID already in use")) {
            setError("Design minted already")
          } else {
            setError("Failed to mint NFT. Please try again.")
          }
          setIsProcessing(false)
          return
        }
      } catch (error) {
        console.error("Transfer error:", error)
        setError("Failed to transfer USDC. Please try again.")
        setIsProcessing(false)
        return
      }
    } catch (err) {
      console.error("Overall error:", err)
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred during the process"
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Mint NFT</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span>Minting Fee:</span>
            <div className="flex items-center">
              <Image src="/iconusdc.svg" alt="USDC" width={24} height={24} />
              <span className="ml-2">{amount.toFixed(2)} USDC</span>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            Payment is required to mint your design as an NFT. This process is irreversible.
          </div>

          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

          <div className="flex gap-2">
            <Button variant="outline" label="Cancel" onClick={onClose} disabled={isProcessing} />
            <Button
              variant="primary"
              label={isProcessing ? "Processing..." : "Pay & Mint"}
              onClick={handlePayment}
              disabled={isProcessing || !account}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
