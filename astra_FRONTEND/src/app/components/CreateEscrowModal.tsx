
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useAccount, useSwitchChain } from 'wagmi';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { config } from '../config';
import { hederaTestnet } from 'viem/chains';
import '@rainbow-me/rainbowkit/styles.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type Props = {
  trigger: React.ReactNode;
  chatId: string;
  token: string;
  open: boolean;
  escrowId?: string;
  conversationId?: string;
  emit?: (event: string, payload: any) => void;
  currentRole?: 'maker' | 'creator';
  onClose?: () => void;
  onOpenChange: (v: boolean) => void;
  onCreateEscrow: (data: {
    makerWallet: string;
    treasuryAddress: string;
    creatorAddress: string;
    amount: string;
  }) => void;
    onShowPaymentMessage?: (payerName: string, amount: string) => void;
    defaultView?: 'create' | 'manage' | 'myescrows';
     onEscrowUpdate?: (newBalance: number) => void;
  // onEscrowFetched?: (details: EscrowDetails) => void;
};


const ESCROW_ABI = [
  "function depositFunds(uint256 amount, address agent) external returns (uint256)",
  "function createEscrowByAgent(address shopper, address maker, address treasury, address creator, uint256 amount) external returns (uint256)",
  "function completeMilestoneByAgent(uint256 escrowId) external",
  "function getEscrowBalance(uint256 escrowId) external view returns (uint256)",
  "function getEscrowDetails(uint256 escrowId) external view returns (tuple(address shopper, address maker, address creator, address treasury, address agent, uint256 amount, uint8 milestonesCompleted, bytes status, uint256 remainingBalance, bool hasCreator))",
  "function getShopperEscrows(address shopper) external view returns (uint256[])"
];

const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

const HEADER_TOKEN_SERVICE_ABI = [
  "function approve(address token, address spender, uint256 amount) external returns (int64 responseCode)"
];

// const ESCROW_ADDRESS = '0x2679b381f17371982b126f93026Ea8a9b50120f7';
const ESCROW_ADDRESS = '0xbC04Fe4B4166Ff8A1c7081A298915EB2DC379586';
const HEDERA_TOKEN_SERVICE_ADDRESS = '0x0000000000000000000000000000000000000167';
const HEDERA_USDC_TOKEN_ADDRESS = '0x0000000000000000000000000000000000068cda';
const constants = [
  'ShopperDetailsReceived',
  'OutfitMade',
  'OutfitDelivered',
  'Complete',
  'Invalid'
];

const STATUS_MAPPING: { [key: string]: string } = {
  ...constants.reduce((acc, constant) => {
    acc[ethers.utils.hexlify(ethers.utils.toUtf8Bytes(constant))] = constant;
    return acc;
  }, {} as Record<string, string>),
};

// Helper function to handle errors
const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

// Create the query client
const queryClient = new QueryClient();

// DirectEscrow Platform component
export default function CreateEscrowModal({
  trigger, 
  chatId,
  token,
  onCreateEscrow, 
  open, 
  emit, 
  currentRole, 
  onClose, 
  conversationId, 
  defaultView,
  onOpenChange, 
  onEscrowUpdate,
}: Props) {
  const [status, setStatus] = useState<string>('');
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [usdcDecimals, setUsdcDecimals] = useState<number>(6);
  const [view, setView] = useState<'create' | 'manage' | 'myescrows'>('create');

  // Create escrow form states
  const [makerAddress, setMakerAddress] = useState<string>('');
  const [treasuryAddress, setTreasuryAddress] = useState<string>('0x487e6D75e34447F38Ad51E4aefCf973D407254d4');
  // const [treasuryAddress, setTreasuryAddress] = useState<string>('');
  const [creatorAddress, setCreatorAddress] = useState<string>('');
  const [escrowAmount, setEscrowAmount] = useState<string>('');
  const [showPaymentMessage, setShowPaymentMessage] = useState(false);

  // Manage escrow states
  const [escrowId, setEscrowId] = useState<string>('');
  const [escrowDetails, setEscrowDetails] = useState<any>(null);
  const [myEscrows, setMyEscrows] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [open, setOpen] = useState(false);

  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [showSuccess, setShowSuccess] = useState(false);

//   useEffect(() => {
//   if (open && defaultView) {
//     setView(defaultView);
//   }
// }, [open, defaultView]);

useEffect(() => {
  if (open) setView(defaultView || 'create');
}, [open, defaultView]);


  // Check if we're on the correct chain
  useEffect(() => {
    if (isConnected) {
      if (chain && chain.id !== hederaTestnet.id) {
        setStatus(`Please switch to Base Sepolia network. Current: ${chain?.name || 'Unknown Network'}`);
        // Prompt to switch network
        if (switchChain) {
          try {
            switchChain({ chainId: hederaTestnet.id as any });
          } catch (err: any) {
            console.error('Failed to switch chain:', err);
            setStatus(`Failed to switch network: ${handleError(err)}`);
          }
        }
      } else if (chain && chain.id === hederaTestnet.id) {
        setStatus(`Connected on ${chain.name}`);

        // Fetch USDC balance
        fetchUsdcBalance();

        // Fetch user's escrows
        if (address) {
          fetchMyEscrows();
        }
      }
    }
  }, [isConnected, chain, address, switchChain]);

  // Fetch USDC balance
  const fetchUsdcBalance = async () => {
    if (!address) return;

    try {
      const provider = new ethers.providers.JsonRpcProvider('https://testnet.hashio.io/api');
      const usdcContract = new ethers.Contract(
        HEDERA_USDC_TOKEN_ADDRESS,
        ERC20_ABI,
        provider
      );

      // Get decimals and balance
      const decimals = await usdcContract.decimals();
      setUsdcDecimals(Number(decimals));

      const balance = await usdcContract.balanceOf(address);
      const formattedBalance = ethers.utils.formatUnits(balance, decimals);
      setUsdcBalance(formattedBalance);
    } catch (error) {
      console.error('Error fetching USDC balance:', error);
    }
  };

  // Fetch user's escrows
  const fetchMyEscrows = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      const provider = new ethers.providers.JsonRpcProvider('https://testnet.hashio.io/api');
      const escrowContract = new ethers.Contract(
        ESCROW_ADDRESS,
        ESCROW_ABI,
        provider
      );

      const escrowIds = await escrowContract.getShopperEscrows(address);
      setMyEscrows(escrowIds.map((id: ethers.BigNumberish) => Number(id)));
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user escrows:', error);
      setStatus(`Error fetching your escrows: ${handleError(error)}`);
      setIsLoading(false);
    }
  };

  // Check USDC Allowance
  const checkUsdcAllowance = async () => {
    if (!address) return '0';

    try {
      const provider = new ethers.providers.JsonRpcProvider('https://testnet.hashio.io/api');
      const usdcContract = new ethers.Contract(
        HEDERA_USDC_TOKEN_ADDRESS,
        ERC20_ABI,
        provider
      );

      const allowance = await usdcContract.allowance(address, ESCROW_ADDRESS);
      return ethers.utils.formatUnits(allowance, usdcDecimals);
    } catch (error) {
      console.error('Error checking allowance:', error);
      return '0';
    }
  };

  // Approve USDC spending
  const approveUsdc = async () => {
    if (!address || !escrowAmount) {
      setStatus('Please enter an amount first');
      return;
    }

    try {
      setIsLoading(true);
      setStatus('Approving USDC...');

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();

      const usdcContract = new ethers.Contract(
        HEDERA_USDC_TOKEN_ADDRESS,
        ERC20_ABI,
        signer
      );

      const amountInWei = ethers.utils.parseUnits(escrowAmount, usdcDecimals);
      const tx = await usdcContract.approve(ESCROW_ADDRESS, amountInWei);

      setStatus('Waiting for approval transaction...');
      await tx.wait();

      setStatus('USDC approved successfully! You can now create an escrow.');
    } catch (error) {
      console.error('Error approving USDC:', error);
      setStatus(`Error: ${handleError(error)}`);
    } finally {
      setIsLoading(false);
    }
  };


  // const depositFunds = async (amount: bigint) => {
  //   if (!address || !amount) {
  //     setStatus('Please enter an amount first');
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);
  //     setStatus('Depositing funds...');

  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = await provider.getSigner();

  //     const escrowContract = new ethers.Contract(
  //       ESCROW_ADDRESS,
  //       ESCROW_ABI,
  //       signer
  //     );

  //     const tx = await escrowContract.depositFunds(amount, address);
  //     await tx.wait();

  //     setStatus('Funds deposited successfully!');
  //     fetchUsdcBalance();
  //   } catch (error) {
  //     console.error('Error depositing funds:', error);
  //     setStatus(`Error: ${handleError(error)}`);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Create a new escrow
//   const createEscrow = async () => {
//     if (!address || !makerAddress || !treasuryAddress || !escrowAmount) {
//       setStatus('Please fill all required fields');
//       return;
//     }

//     try {
//       // First check allowance
//       const allowance = await checkUsdcAllowance();
//       const amountInWei = ethers.utils.parseUnits(escrowAmount, usdcDecimals);

//       if (parseFloat(allowance) < parseFloat(escrowAmount)) {
//         setStatus('Insufficient allowance. Please approve USDC first.');
//         setIsLoading(false);
//         return;
//       }
//       await depositFunds(BigInt(amountInWei.toString()));
//       setIsLoading(true);

//       setStatus('Creating escrow...');
//       // Connect to provider with signer
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = await provider.getSigner();

//       // Create escrow contract instance
//       const escrowContract = new ethers.Contract(
//         ESCROW_ADDRESS,
//         ESCROW_ABI,
//         signer
//       );

//       // Create the escrow
//       const tx = await escrowContract.createEscrowByAgent(
//         address,
//         makerAddress,
//         treasuryAddress,
//         creatorAddress || ethers.constants.AddressZero, // Use zero address if no creator
//         amountInWei
//       );

//       setStatus('Waiting for transaction to be mined...');
//       const receipt = await tx.wait();

//       // Try to extract the escrow ID from the transaction receipt logs
//       let newEscrowId = null;
//       if (receipt && receipt.logs) {
//         for (const log of receipt.logs) {
//           try {
//             const escrowInterface = new ethers.utils.Interface(ESCROW_ABI);
//             const parsedLog = escrowInterface.parseLog(log);
//             if (parsedLog && parsedLog.name === 'EscrowCreated') {
//               newEscrowId = parsedLog.args.escrowId;
//               break;
//             }
//           } catch (e) {
//             // Skip logs that can't be parsed with our interface
//           }
//         }
//       }

//       if (newEscrowId !== null) {
//         setStatus(`Escrow created successfully! Escrow ID: ${newEscrowId}`);
//       } else {
//         setStatus('Escrow created successfully!');
//       }

//       // Reset form
//       setMakerAddress('');
//       setTreasuryAddress('');
//       setCreatorAddress('');
//       setEscrowAmount('');

//       // Refresh balances and user's escrows
//       fetchUsdcBalance();
//       fetchMyEscrows();
//       // Automatically select the newest escrow
//       if (address) {
//         const provider = new ethers.providers.JsonRpcProvider('https://testnet.hashio.io/api');
//         const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);
//         const escrowIds = await escrowContract.getShopperEscrows(address);
//         if (escrowIds.length > 0) {
//           const latestId = Number(escrowIds[escrowIds.length - 1]);
//           setEscrowId(latestId.toString());
//           setStatus(`Escrow created successfully! Your new escrow ID: ${latestId}`);
//         }
//       }

//       // Switch to manage tab and show the new escrow details
//       if (newEscrowId) {
//         setEscrowId(newEscrowId.toString());
//         setView('manage');
//         await fetchEscrowDetails(newEscrowId.toString());
//       } else {
//         // fallback: still switch to manage and fetch latest
//         setView('manage');
//         await fetchLatestEscrow();
//       }

//       setStatus('Escrow created successfully! You can now manage your escrow.');

// if (newEscrowId) {
//   setView('manage');
//   await fetchEscrowDetails(newEscrowId.toString());
// } else {
//   setView('manage');
//   await fetchLatestEscrow();
// }


//     } catch (error) {
//       console.error('Error creating escrow:', error);
//       setStatus(`Error: ${handleError(error)}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

const depositFunds = async (amount: bigint) => {
  if (!address || !amount) {
    setStatus('Please enter an amount first');
    return;
  }

  try {
    setIsLoading(true);
    setStatus('Depositing funds...');

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();

    const escrowContract = new ethers.Contract(
      ESCROW_ADDRESS,
      ESCROW_ABI,
      signer
    );

    // 💰 On-chain deposit
    const tx = await escrowContract.depositFunds(amount, address);
    await tx.wait();

    setStatus('Funds deposited successfully!');

    // ✅ Notify backend (no body required)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const token = localStorage.getItem('token');

    if (baseUrl && token && chatId) {
      try {
        const res = await fetch(`${baseUrl}/marketplace/chat/${chatId}/escrow/fund`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          console.error('Backend error:', errData);
          setStatus(`Backend error: ${errData?.message || res.statusText}`);
        } else {
          setStatus('Escrow funded and synced to backend successfully!');
        }
      } catch (err) {
        console.error('Error syncing funding to backend:', err);
        setStatus('Error syncing funding to backend.');
      }
    } else {
      console.warn('Missing token, baseUrl, or chatId for backend call');
    }

    // 🔄 Refresh balances
    fetchUsdcBalance();
  } catch (error) {
    console.error('Error depositing funds:', error);
    setStatus(`Error: ${handleError(error)}`);
  } finally {
    setIsLoading(false);
  }
};


const createEscrow = async () => {
  if (!address || !makerAddress || !treasuryAddress || !escrowAmount) {
    setStatus('Please fill all required fields');
    return;
  }

  try {
    // First check allowance
    const allowance = await checkUsdcAllowance();
    const amountInWei = ethers.utils.parseUnits(escrowAmount, usdcDecimals);

    if (parseFloat(allowance) < parseFloat(escrowAmount)) {
      setStatus('Insufficient allowance. Please approve USDC first.');
      setIsLoading(false);
      return;
    }

    await depositFunds(BigInt(amountInWei.toString()));
    setIsLoading(true);

    setStatus('Creating escrow...');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();

    const escrowContract = new ethers.Contract(
      ESCROW_ADDRESS,
      ESCROW_ABI,
      signer
    );

    const tx = await escrowContract.createEscrowByAgent(
      address,
      makerAddress,
      treasuryAddress,
      creatorAddress || ethers.constants.AddressZero,
      amountInWei
    );

    setStatus('Waiting for transaction to be mined...');
    const receipt = await tx.wait();

    let newEscrowId = null;
    if (receipt && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const escrowInterface = new ethers.utils.Interface(ESCROW_ABI);
          const parsedLog = escrowInterface.parseLog(log);
          if (parsedLog && parsedLog.name === 'EscrowCreated') {
            newEscrowId = parsedLog.args.escrowId;
            break;
          }
        } catch (e) {}
      }
    }

    // ✅ Step 1: Send POST request to backend after escrow is created
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const token = localStorage.getItem('token'); // assuming you store JWT in localStorage
    // const chatId = selectedChatId || chatId; // adjust this depending on how you store chatId

    if (token && baseUrl && chatId) {
      try {
        const res = await fetch(`${baseUrl}/marketplace/chat/${chatId}/escrow/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: escrowAmount,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          console.error('Backend error:', errData);
          setStatus(`Backend error: ${errData.message || res.statusText}`);
        } else {
          setStatus('Escrow synced to backend successfully!');
        }
      } catch (err) {
        console.error('Error syncing with backend:', err);
        setStatus('Error syncing with backend.');
      }
    } else {
      console.warn('Missing token, baseUrl, or chatId');
    }

    // ✅ Step 2: Reset form and update UI
    setMakerAddress('');
    setTreasuryAddress('');
    setCreatorAddress('');
    setEscrowAmount('');

    fetchUsdcBalance();
    fetchMyEscrows();

    if (address) {
      const provider = new ethers.providers.JsonRpcProvider('https://testnet.hashio.io/api');
      const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);
      const escrowIds = await escrowContract.getShopperEscrows(address);
      if (escrowIds.length > 0) {
        const latestId = Number(escrowIds[escrowIds.length - 1]);
        setEscrowId(latestId.toString());
        setStatus(`Escrow created successfully! Your new escrow ID: ${latestId}`);
      }
    }

    if (newEscrowId) {
      setView('manage');
      await fetchEscrowDetails(newEscrowId.toString());
    } else {
      setView('manage');
      await fetchLatestEscrow();
    }

    setStatus('Escrow created successfully! You can now manage your escrow.');
  } catch (error) {
    console.error('Error creating escrow:', error);
    setStatus(`Error: ${handleError(error)}`);
  } finally {
    setIsLoading(false);
  }
};


  const getProvider = () => new ethers.providers.JsonRpcProvider('https://testnet.hashio.io/api');
  const getSigner = () => new ethers.providers.Web3Provider(window.ethereum).getSigner();


  const fetchLatestEscrow = async () => {
    if (!address) return;
    try {
      const provider = getProvider();
      const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);
      const ids = await escrow.getShopperEscrows(address);
      if (ids.length > 0) {
        const latestId = Number(ids[ids.length - 1]);
        setEscrowId(latestId.toString());
        await fetchEscrowDetails(latestId.toString());
      } else {
        setStatus('No escrows found.');
      }
    } catch (err) {
      console.error('Error fetching latest escrow:', err);
    }
  };


  // Fetch escrow details
  const fetchEscrowDetails = async (id = escrowId) => {
  if (!id) {
    setStatus('Please enter an escrow ID');
    return;
  }

  try {
    setIsLoading(true);
    setStatus('Fetching escrow details...');

    const provider = new ethers.providers.JsonRpcProvider('https://testnet.hashio.io/api');
    const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);

    const details = await escrowContract.getEscrowDetails(id);

    let statusText = 'Unknown';
    try {
      const statusHex = ethers.utils.hexlify(details[7]);
      statusText = STATUS_MAPPING[statusHex] || 'Unknown';
    } catch (statusError) {
      console.warn('Error converting status:', statusError);
    }

    const formattedDetails = {
      shopper: details[0],
      maker: details[1],
      creator: details[2],
      treasury: details[3],
      agent: details[4],
      amount: ethers.utils.formatUnits(details[5], usdcDecimals),
      milestonesCompleted: Number(details[6]),
      status: statusText,
      remainingBalance: ethers.utils.formatUnits(details[8], usdcDecimals),
      hasCreator: details[9],
    };

    setEscrowDetails(formattedDetails);
    setStatus('Escrow details fetched successfully!');

    // ✅ Trigger update callback here
    if (onEscrowUpdate) {
      onEscrowUpdate(Number(formattedDetails.remainingBalance));
    }
  } catch (error) {
    console.error('Error fetching escrow details:', error);
    setStatus(`Error: ${handleError(error)}`);
    setEscrowDetails(null);
  } finally {
    setIsLoading(false);
  }
};

  // Complete milestone
//   const completeMilestone = async () => {
//     if (!escrowId) {
//       setStatus("Please enter an escrow ID");
//       return;
//     }
//     try {
//       setIsLoading(true);
//       setStatus("Completing milestone...");

//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = await provider.getSigner();
//       const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);

//       // 🔹 Get current escrow details to know which milestone we're completing
//       const details = await escrowContract.getEscrowDetails(escrowId);
//       const currentMilestone = Number(details[6]); // milestonesCompleted
//       const totalAmount = parseFloat(ethers.utils.formatUnits(details[5], usdcDecimals));
//       const milestonePercentages = [0.3, 0.3, 0.4];
//       const milestoneAmount = (totalAmount * milestonePercentages[currentMilestone]).toFixed(2);
// // 🧠 Save milestone amount to localStorage for PaymentMessage
// localStorage.setItem("latestMilestoneAmount", milestoneAmount);

//       // 🔹 Complete milestone on-chain
//       const tx = await escrowContract.completeMilestoneByAgent(escrowId);
//       await tx.wait();
      
//       setStatus("Milestone completed successfully!");
      
//       // 🔹 Refresh escrow details
//       await fetchEscrowDetails(escrowId);
      
//       // 🔹 Notify backend so chat shows PaymentMessage
//       try {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/${conversationId}/message`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify({
//                 type: "system",
//               actionType: "payment_approved",
//               content: ``,
//               amount: milestoneAmount,
//               // milestone: currentMilestone + 1, // 1-based milestone number
//               // transactionHash: tx.hash,
//               // payerName: "You", // optional extra data if your backend accepts it
//             }),
//           }
//         );
        
//         if (!res.ok) {
//           console.error("Failed to notify backend:", await res.text());
//         } else {
//           console.log("Backend notified of milestone completion.");
//         }
//       } catch (notifyError) {
//         console.error("Error notifying backend:", notifyError);
//       }
//       // 🔹 Emit socket event instantly (so UI updates immediately)
//       if (emit) {
//         const generateId = () => Math.random().toString(36).substring(2, 10);

//         emit("sendMessage", {
//           conversationId,
//           type: "system",
//           actionType: "payment_approved",
//           content: `Milestone payment released`,
//           sender: "system", // ✅ better to mark as system message
//           clientMessageId: generateId(),
//           data: {
//             payerName: "You",
//             amount: milestoneAmount, // ✅ now correct milestone portion
//           },
//         });
//       }

//       // 🔹 Close modal
//       if (onClose) onClose();
//       else if (onOpenChange) onOpenChange(false);
//     } catch (error) {
//       console.error("Error completing milestone:", error);
//       setStatus(`Error: ${handleError(error)}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

const completeMilestone = async () => {
  if (!escrowId) {
    setStatus("Please enter an escrow ID");
    return;
  }
  try {
    setIsLoading(true);
    setStatus("Completing milestone...");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);

    // 🔹 Get current escrow details to know which milestone we're completing
    const details = await escrowContract.getEscrowDetails(escrowId);
    const currentMilestone = Number(details[6]); // milestonesCompleted
    const totalAmount = parseFloat(ethers.utils.formatUnits(details[5], usdcDecimals));
    const milestonePercentages = [0.3, 0.3, 0.4];
    const milestoneAmount = (totalAmount * milestonePercentages[currentMilestone]).toFixed(2);

    // 🧠 Save milestone amount to localStorage for PaymentMessage
    localStorage.setItem("latestMilestoneAmount", milestoneAmount);

    // 🔹 Complete milestone on-chain
    const tx = await escrowContract.completeMilestoneByAgent(escrowId);
    await tx.wait();

    // ✅ Notify backend about release (no body required)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const token = localStorage.getItem("token");

    if (baseUrl && token && conversationId) {
      try {
        const res = await fetch(`${baseUrl}/marketplace/chat/${conversationId}/escrow/release`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          console.error("Backend release error:", errData);
          setStatus(`Backend error: ${errData?.message || res.statusText}`);
        } else {
          console.log("Backend escrow release synced successfully!");
        }
      } catch (err) {
        console.error("Error syncing release to backend:", err);
        setStatus("Error syncing release to backend.");
      }
    } else {
      console.warn("Missing token, baseUrl, or conversationId for backend call");
    }

    setStatus("Milestone completed successfully!");
    
    // 🔹 Refresh escrow details
    await fetchEscrowDetails(escrowId);
    
    // 🔹 Notify backend so chat shows PaymentMessage
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/chat/${conversationId}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: "system",
            actionType: "payment_approved",
            content: ``,
            amount: milestoneAmount,
            // milestone: currentMilestone + 1,
            // transactionHash: tx.hash,
            // payerName: "You",
          }),
        }
      );
      
      if (!res.ok) {
        console.error("Failed to notify backend:", await res.text());
      } else {
        console.log("Backend notified of milestone completion.");
      }
    } catch (notifyError) {
      console.error("Error notifying backend:", notifyError);
    }

    // 🔹 Emit socket event instantly (so UI updates immediately)
    if (emit) {
      const generateId = () => Math.random().toString(36).substring(2, 10);

      emit("sendMessage", {
        conversationId,
        type: "system",
        actionType: "payment_approved",
        content: `Milestone payment released`,
        sender: "system",
        clientMessageId: generateId(),
        data: {
          payerName: "You",
          amount: `${milestoneAmount}`,
        },
      });
    }

    // 🔹 Close modal
    if (onClose) onClose();
    else if (onOpenChange) onOpenChange(false);
  } catch (error) {
    console.error("Error completing milestone:", error);
    setStatus(`Error: ${handleError(error)}`);
  } finally {
    setIsLoading(false);
  }
};


  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Check if the current user is the shopper for the escrow
  const isShopper = () => {
    return escrowDetails && address && escrowDetails.shopper.toLowerCase() === address.toLowerCase();
  };

  useEffect(() => {
    if (escrowId) {
      fetchEscrowDetails(escrowId);
    }
  }, [escrowId]);

  // When switching to "manage" tab, automatically fetch the latest escrow
  useEffect(() => {
    if (view === 'manage' && address) {
      fetchLatestEscrow();
    }
  }, [view, address]);



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="max-w-2xl sm:max-w-3xl font-[ClashGrotesk-regular] w-full bg-white rounded-3xl shadow-lg border border-gray-200 p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className='flex justify-between w-full mt-8 items-center'>
            <div className="flex flex-col">
              <div className="flex gap-2 items-center">
                <Image src="/bank-fill.svg" alt="escrow" width={24} height={24} />
                <DialogTitle className="text-2xl font-[ClashGrotesk-Bold] text-black">
                  Create & Manage Escrow
                </DialogTitle>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Securely manage your escrow transactions
              </p>
            </div>

            {isConnected && (
              <div className="bg-gray-50 text-black rounded-xl px-5 py-2 text-sm">
                {/* <p className="font-medium">{chain?.name || 'Unknown Network'}</p>  */}
                <h1 className='text-[#828282]'>Wallet balance:</h1>
                <p className="text-2xl text-[#1D40C8] font-[ClashGrotesk-Medium] mt-1">${usdcBalance} USDC</p>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex justify-center border-b border-gray-100">
          {[
            'create',
            'manage',
            'myescrows'
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab as any)}
              className={`px-6 py-3 text-sm font-medium transition-all duration-150 ${view === tab
                ? 'text-black border-b-2 border-black'
                : 'text-gray-400 hover:text-gray-700'
                }`}
            >
              {tab === 'create'
                ? 'Create Escrow'
                : tab === 'manage'
                  ? 'Manage Escrow'
                  : 'My Escrows'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
          {/* CREATE VIEW */}
          {view === 'create' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Brand Wallet Address
                </label>
                <input
                  type="text"
                  value={makerAddress}
                  onChange={(e) => setMakerAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full border border-gray-200 rounded-full h-11 text-sm px-4 focus:border-black outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  Treasury Address
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-normal">
                    Astra
                  </span>
                </label>
                <input
                  type="text"
                  value="0x487e6D75e34447F38Ad51E4aefCf973D407254d4"
                  readOnly
                  className="w-full border border-gray-200 rounded-full h-11 text-sm px-4 text-gray-500 bg-gray-100 cursor-not-allowed"
                />
              </div>


              {/* <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Your Wallet Address{' '}
                  <span className="text-xs text-gray-500">(for refunds)</span>
                </label>
                <input
                  type="text"
                  value={creatorAddress}
                  onChange={(e) => setCreatorAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full border border-gray-200 rounded-full h-11 text-sm px-4 focus:border-black outline-none"
                />
              </div> */}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Escrow Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={escrowAmount}
                    onChange={(e) => setEscrowAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-full h-11 text-sm px-4 pr-16 focus:border-black outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    USDC
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-2">
                {/* If currently approving or creating */}
                {isLoading && (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-500 rounded-full h-12 text-base font-medium flex justify-center items-center"
                  >
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-gray-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Processing...
                  </button>
                )}

                {/* Show Approve button first */}
                {!isLoading && !showSuccess && (
                  <button
                    onClick={async () => {
                      await approveUsdc();
                      setShowSuccess(true);
                    }}
                    disabled={!isConnected || !escrowAmount}
                    className="w-full bg-black text-white rounded-full h-12 text-base font-medium shadow-lg disabled:opacity-50"
                  >
                    Approve
                  </button>
                )}

                {/* After approval success, show Create Escrow button */}
                {!isLoading && showSuccess && (
                  <button
                    onClick={createEscrow}
                    disabled={!makerAddress || !escrowAmount}
                    className="w-full bg-black text-white rounded-full h-12 text-base font-medium shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {/* <CheckCircle2 className="w-5 h-5 text-green-400" /> */}
                    Create Escrow
                  </button>
                )}
              </div>

            </div>
          )}

          {view === 'manage' && (
            <div className="space-y-5">
              <div className="space-y-2 opacity-0 h-0 overflow-hidden">
                {/* hidden escrow input */}
                <label className="text-sm font-medium text-gray-700">Escrow ID</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={escrowId}
                    onChange={(e) => setEscrowId(e.target.value)}
                    placeholder="Enter escrow ID"
                    className="flex-1 border border-gray-200 rounded-full h-11 text-sm px-4 focus:border-black outline-none"
                  />
                  <button
                    onClick={() => fetchEscrowDetails(escrowId)}
                    disabled={isLoading || !escrowId}
                    className="bg-black text-white rounded-full px-6 text-sm font-medium shadow disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Fetch'}
                  </button>
                </div>
              </div>

              {/* 🌀 Spinner or Escrow Details */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3"></div>
                  <p className="text-sm">Fetching escrow details...</p>
                </div>
              ) : escrowDetails ? (
                <div className="p-4 border border-gray-200 rounded-2xl space-y-3 bg-gray-50">
                  <h4 className="font-semibold text-lg">Escrow Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>
                      <span className="text-gray-500">Shopper Address:</span> {escrowDetails.shopper}
                    </p>
                    <p>
                      <span className="text-gray-500">Brand Address:</span> {escrowDetails.maker}
                    </p>
                    <p>
                      <span className="text-gray-500">Treasury Address:</span> {escrowDetails.treasury}
                    </p>
                    <p>
                      <span className="text-gray-500">Amount:</span> ${escrowDetails.amount} USDC
                    </p>
                    <p>
                      <span className="text-gray-500">Status:</span> {escrowDetails.status}
                    </p>
                    {/* <p>
                      <span className="text-gray-500">Remaining Balance:</span>{' '}
                      {escrowDetails.remainingBalance} USDC
                    </p> */}
                  </div>

                  {isShopper() && (
                    <button
                      onClick={completeMilestone}
                      className="w-full bg-black text-white rounded-full h-11 font-medium mt-4"
                    >
                      Make Payment
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4">
                  No escrow details loaded.
                </p>
              )}
            </div>
          )}
          {/* MY ESCROWS */}
         {view === 'myescrows' && (
  <div className="space-y-4 h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
    <p className="text-gray-700 font-medium">
      You have {myEscrows.length || 0} escrow(s)
    </p>

    <div className="grid gap-3">
      {myEscrows.map((id: any) => (
        <div
          key={id}
          className="p-4 border border-gray-200 rounded-2xl flex justify-between items-center hover:bg-gray-50"
        >
          <p className="font-medium text-gray-800">Escrow #{id}</p>
          <button
            onClick={() => fetchEscrowDetails(id.toString())}
            className="bg-black text-white rounded-full px-4 py-1 text-sm"
          >
            View
          </button>
        </div>
      ))}
    </div>
  </div>
)}

        </div>
      </DialogContent>
    </Dialog>
  );
};
