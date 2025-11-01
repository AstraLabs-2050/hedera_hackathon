import React, { useState, useEffect } from 'react';
import { useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import type { ThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { ASTRA_NFT_ABI } from './abis/AstraNFT_ABI';

interface NFTMintProps {
  contractAddress: string;
  onMintSuccess?: () => void;
  client: ThirdwebClient;
}

const NFTMint: React.FC<NFTMintProps> = ({ contractAddress, onMintSuccess, client }) => {
  const account = useActiveAccount();
  const address = account?.address;
  
  const [isLoading, setIsLoading] = useState(false);
  const [contract, setContract] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    designId: "",
    designName: "",
    fabricType: "",
    designImage: "",
    prompt: "",
  });
  
  const [message, setMessage] = useState<string | null>(null);
  
  // Initialize contract
  useEffect(() => {
    if (!client || !account) return;
    
    try {
      const contractInstance = getContract({
        client,
        chain: baseSepolia,
        address: contractAddress,
        abi: ASTRA_NFT_ABI as any,
      });
      
     
      
      setContract(contractInstance);
    } catch (err) {
      console.error("Error initializing contract:", err);
      setMessage(`Error: Failed to initialize contract. Please try again.`);
    }
  }, [client, account, contractAddress]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !contract) {
      console.error("Missing dependencies:", { address, contract });
      return;
    }
    
    try {
      setIsLoading(true);
      setMessage("Minting your NFT...");
      
    
      
      // Prepare the contract call
      const transaction = prepareContractCall({
        contract,
        method: "function mintNFT(address to, string designId, string designName, string fabricType, string designImage, string prompt, string metadataURI) returns (uint256)",
        params: [
          address,                    // to - use connected address
          formData.designId,         // designId
          formData.designName,       // designName
          formData.fabricType,       // fabricType
          formData.designImage,      // designImage
          formData.prompt,           // prompt
          "ipfs://placeholder"       // metadataURI
        ]
      });
      
      
      
      // Check if account is available and use it directly
      if (!account) {
        throw new Error("No active account found");
      }
      
      // Send transaction
      const result = await sendTransaction({
        account: account, // Ensure the account is passed correctly
        transaction: transaction // Use prepared transaction
      });
      
    
      setMessage(`NFT minting transaction submitted! Hash: ${result.transactionHash}`);
      
      // Reset form
      setFormData({
        designId: "",
        designName: "",
        fabricType: "",
        designImage: "",
        prompt: "",
      });
      
      // Call the onMintSuccess callback if provided
      if (onMintSuccess) {
        onMintSuccess();
      }
      
    } catch (err) {
      console.error("Error minting NFT:", err);
      setMessage(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="nft-mint">
      <h2>Mint a New NFT</h2>
      
      <div className="connected-address-info">
        <div>
          <strong>Connected Address:</strong> {address}
        </div>
        <small>This address will be both the creator and owner of the NFT</small>
        <div className={`account-status ${account ? '' : 'disconnected'}`}>
          Account status: {account ? 'Connected' : 'Not connected'}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="mint-form">
        <div className="form-group">
          <label htmlFor="designId">Design ID:</label>
          <input
            type="text"
            id="designId"
            name="designId"
            value={formData.designId}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="designName">Design Name:</label>
          <input
            type="text"
            id="designName"
            name="designName"
            value={formData.designName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="fabricType">Fabric Type:</label>
          <input
            type="text"
            id="fabricType"
            name="fabricType"
            value={formData.fabricType}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="designImage">Design Image URL:</label>
          <input
            type="text"
            id="designImage"
            name="designImage"
            value={formData.designImage}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="prompt">Design Prompt:</label>
          <textarea
            id="prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading || !account} className="mint-button">
          {isLoading ? "Minting..." : "Mint NFT"}
        </button>
      </form>
      
      {message && (
        <div className={message.includes("Error") ? "error-message" : "success-message"}>
          {message}
        </div>
      )}
    </div>
  );
};

export default NFTMint;