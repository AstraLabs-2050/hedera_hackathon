import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";

const HEDERA_TESTNET = {
  chainId: "0x128",
  chainName: "Hedera Testnet",
  rpcUrls: ["https://testnet.hashio.io/api"],
  nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
  blockExplorerUrls: ["https://hashscan.io/testnet"],
};

interface UseWalletReturn {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  address: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<void>;
  switchToHederaTestnet: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useWallet(autoConnect = true): UseWalletReturn {
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchToHederaTestnet = useCallback(async () => {
    if (!window.ethereum) throw new Error("MetaMask not detected");

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HEDERA_TESTNET.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        // Chain not added
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [HEDERA_TESTNET],
        });
      } else {
        throw switchError;
      }
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask.");
      throw new Error("MetaMask not installed");
    }

    setLoading(true);
    setError(null);

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      const tempSigner = tempProvider.getSigner();
      const userAddress = await tempSigner.getAddress();

      // Check network
      const network = await tempProvider.getNetwork();
      const currentChainId = `0x${network.chainId.toString(16)}`;

      if (currentChainId !== HEDERA_TESTNET.chainId) {
        await switchToHederaTestnet();
      }

      setProvider(tempProvider);
      setSigner(tempSigner);
      setAddress(userAddress);
      setIsCorrectNetwork(true);

      //   console.log("Wallet connected:", userAddress);
    } catch (err) {
      const message = err.message || "Failed to connect wallet";
      setError(message);
      toast.error(message);
      //   console.error("Wallet connection error:", err);
    } finally {
      setLoading(false);
    }
  }, [switchToHederaTestnet]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connectWallet();
    }
  }, [autoConnect, connectWallet]);

  // Listen for account/network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // Disconnected
        setAddress(null);
        setSigner(null);
        setProvider(null);
        setIsCorrectNetwork(false);
      } else {
        connectWallet(); // Reconnect with new account
      }
    };

    const handleChainChanged = () => {
      window.location.reload(); // Simplest: reload to reinitialize
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [connectWallet]);

  return {
    provider,
    signer,
    address,
    isConnected: !!address && isCorrectNetwork,
    isCorrectNetwork,
    connectWallet,
    switchToHederaTestnet,
    loading,
    error,
  };
}
