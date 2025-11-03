import React, { useState, useEffect } from 'react';
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import type { ThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { ASTRA_NFT_ABI} from "../../abis/AstraNFT_ABI"

interface NFTItem {
  id: string;
  designName: string;
  fabricType: string;
  designImage: string;
  prompt: string;
  imageError?: boolean;
}

interface MyNFTsProps {
  contractAddress: string;
  client: ThirdwebClient;
}

const MyNFTs: React.FC<MyNFTsProps> = ({ contractAddress, client }) => {
  const account = useActiveAccount();
  const address = account?.address;
  
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputTokenId, setInputTokenId] = useState('');
  const [contract, setContract] = useState<any>(null);
  
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
      setError("Failed to initialize contract. Please try again.");
    }
  }, [client, account, contractAddress]);
  
  // Function to manually check a specific token ID
  const checkAndAddToken = async (tokenId: number) => {
    if (!address || !contract) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Try to check the owner of this token ID
      const owner = await contract.call("ownerOf", [tokenId]);
      
      // If the current user is the owner
      if (owner.toLowerCase() === address.toLowerCase()) {
        // Check if we already have this NFT in our list to avoid duplicates
        if (nfts.some(nft => nft.id === tokenId.toString())) {
          setLoading(false);
          return; // Skip if already in the list
        }
        
        // Get the metadata using contract.call instead of readContract
        const designName = await contract.call("getDesignName", [tokenId]);
        
        const fabricType = await contract.call("getFabricType", [tokenId]);
        
        const designImage = await contract.call("getDesignImage", [tokenId]);
        
        const prompt = await contract.call("getPrompt", [tokenId]);
        
        // Add to the list of NFTs
        setNfts(prev => [
          ...prev,
          {
            id: tokenId.toString(),
            designName,
            fabricType,
            designImage,
            prompt
          }
        ]);
      } else {
        setError(`You don't own the NFT with ID ${tokenId}`);
      }
      
    } catch (err) {
      console.error(`Error checking NFT #${tokenId}:`, err);
      setError(`Token ID ${tokenId} does not exist or is not accessible`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse the token ID
    const tokenId = parseInt(inputTokenId);
    if (isNaN(tokenId)) {
      setError('Please enter a valid token ID (number)');
      return;
    }
    
    // Check and add the token
    checkAndAddToken(tokenId);
    
    // Clear the input field
    setInputTokenId('');
  };
  
  // Function to remove an NFT from the list
  const removeNFT = (tokenId: string) => {
    setNfts(prev => prev.filter(nft => nft.id !== tokenId));
  };
  
  // Function to handle image error
  const handleImageError = (tokenId: string) => {
    setNfts(prev => prev.map(nft => 
      nft.id === tokenId ? { ...nft, imageError: true } : nft
    ));
  };
  
  // Function to check if URL is valid
  const isValidUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };
  
  return (
    <div className="my-nfts">
      <h2>My NFTs</h2>
      
      <form onSubmit={handleSubmit} className="nft-lookup-form">
        <div className="form-group">
          <label>Add NFT by ID:</label>
          <input
            type="text"
            value={inputTokenId}
            onChange={(e) => setInputTokenId(e.target.value)}
            placeholder="Enter token ID..."
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Add NFT'}
        </button>
      </form>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {nfts.length === 0 ? (
        <div className="no-nfts-message">
          <p>No NFTs in your collection. Add an NFT by entering its ID above.</p>
          <p>If you just minted an NFT, try adding it with ID 0, 1, 2, etc.</p>
        </div>
      ) : (
        <div className="nft-grid">
          {nfts.map((nft) => (
            <div key={nft.id} className="nft-card">
              <button 
                className="remove-nft-btn" 
                onClick={() => removeNFT(nft.id)}
                title="Remove from view"
              >
                ×
              </button>
              
              {/* Image with error handling */}
              {nft.imageError || !nft.designImage || !isValidUrl(nft.designImage) ? (
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}>
                  {nft.designImage ? 'Invalid Image URL' : 'No Image'}
                </div>
              ) : (
                <img 
                  src={nft.designImage}
                  alt={nft.designName}
                  onError={() => handleImageError(nft.id)}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              )}
              
              <h3>{nft.designName}</h3>
              <p>Fabric Type: {nft.fabricType}</p>
              <p>Prompt: {nft.prompt}</p>
              <p>Token ID: {nft.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNFTs;