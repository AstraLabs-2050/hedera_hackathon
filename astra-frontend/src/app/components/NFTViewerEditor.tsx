import React, { useState, useEffect } from 'react';
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import type { ThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { ASTRA_NFT_ABI } from '../../abis/AstraNFT_ABI';

interface NFTMetadata {
  id: string;
  designId: string;
  designName: string;
  fabricType: string;
  designImage: string;
  prompt: string;
  owner: string;
  isOwner: boolean;
  previousOwners: string[];
  usersOfDesign: string[];
}

interface NFTViewerEditorProps {
  contractAddress: string;
  client: ThirdwebClient;
}

const NFTViewerEditor: React.FC<NFTViewerEditorProps> = ({ contractAddress, client }) => {
  const account = useActiveAccount();
  const address = account?.address;
  
  const [tokenId, setTokenId] = useState('');
  const [nftData, setNftData] = useState<NFTMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    designName: '',
    fabricType: '',
    designImage: '',
    prompt: ''
  });
  
  // Transfer state
  const [transferToAddress, setTransferToAddress] = useState('');
  const [showTransferForm, setShowTransferForm] = useState(false);
  
  // Add user state
  const [userToAdd, setUserToAdd] = useState('');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  
  // Get contract
  const [contract, setContract] = useState<any>(null);
  
  // Initialize contract
  useEffect(() => {
    if (!client) return;
    
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
  }, [client, contractAddress]);
  
  // Function to fetch NFT data
  const fetchNFTData = async () => {
    if (!contract || !tokenId || !address) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      setNftData(null);
      setShowTransferForm(false);
      setShowAddUserForm(false);
      setImageError(false);
      
      // Parse the token ID to ensure it's a valid number
      const tokenIdNumber = parseInt(tokenId);
      if (isNaN(tokenIdNumber)) {
        throw new Error('Please enter a valid token ID (number)');
      }
      
      
      let owner: string;
      try {
        // First try to get the owner - this will throw if the token doesn't exist
        owner = await contract.call("ownerOf", [tokenIdNumber]);
     
        
        // Get the NFT metadata using the getter functions
        const designId = await contract.call("getDesignId", [tokenIdNumber]);
        
        const designName = await contract.call("getDesignName", [tokenIdNumber]);
        
        const fabricType = await contract.call("getFabricType", [tokenIdNumber]);
        
        const designImage = await contract.call("getDesignImage", [tokenIdNumber]);
        
        const prompt = await contract.call("getPrompt", [tokenIdNumber]);
        
        // Get previous owners and users
        const previousOwners = await contract.call("getPreviousOwners", [tokenIdNumber]);
        
        const usersOfDesign = await contract.call("getUsersOfDesign", [tokenIdNumber]);
        
        // Set the NFT data
        const nftMetadata: NFTMetadata = {
          id: tokenIdNumber.toString(),
          designId,
          designName,
          fabricType,
          designImage,
          prompt,
          owner,
          isOwner: owner.toLowerCase() === address.toLowerCase(),
          previousOwners,
          usersOfDesign
        };
        
        setNftData(nftMetadata);
        
        // Set the edit form initial values
        setEditForm({
          designName,
          fabricType,
          designImage,
          prompt
        });
        
      } catch (err) {
        console.error(`Error fetching data for token ${tokenIdNumber}:`, err);
        throw new Error(`Token ID ${tokenIdNumber} does not exist or has been burned`);
      }
      
    } catch (err) {
      console.error("Error fetching NFT:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNFTData();
  };
  
  // Function to update metadata
  const updateMetadata = async (field: 'designName' | 'fabricType' | 'designImage' | 'prompt') => {
    if (!contract || !nftData || !address || !account) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Determine which function to call based on the field
      let functionName: string;
      let newValue: string;
      
      switch (field) {
        case 'designName':
          functionName = "updateDesignName";
          newValue = editForm.designName;
          break;
        case 'fabricType':
          functionName = "updateFabricType";
          newValue = editForm.fabricType;
          break;
        case 'designImage':
          functionName = "updateDesignImage";
          newValue = editForm.designImage;
          break;
        case 'prompt':
          functionName = "updatePrompt";
          newValue = editForm.prompt;
          break;
        default:
          throw new Error("Invalid field to update");
      }
      
      // Call the update function using contract.write
      const tx = await contract.write(functionName, [nftData.id, newValue], { account });
      
    
      setSuccessMessage(`Successfully updated ${field}!`);
      
      // Update the local NFT data
      setNftData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [field]: newValue
        };
      });
      
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      setError(`Error updating ${field}: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to transfer NFT
  const transferNFT = async () => {
    if (!contract || !nftData || !address || !transferToAddress || !account) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      if (!transferToAddress || !transferToAddress.startsWith('0x') || transferToAddress.length !== 42) {
        throw new Error('Please enter a valid Ethereum address');
      }
      
      // Call the transfer function using contract.write
      const tx = await contract.write("transferNFT", [transferToAddress, nftData.id], { account });
      
    
      setSuccessMessage(`Successfully transferred NFT to ${transferToAddress}!`);
      
      // Update local data
      setNftData(prev => {
        if (!prev) return null;
        
        // Add current owner to previous owners list
        const updatedPreviousOwners = [...prev.previousOwners, prev.owner];
        
        return {
          ...prev,
          owner: transferToAddress,
          previousOwners: updatedPreviousOwners,
          isOwner: false // No longer the owner
        };
      });
      
      // Reset transfer form
      setTransferToAddress('');
      setShowTransferForm(false);
      
    } catch (err) {
      console.error("Error transferring NFT:", err);
      setError(`Error transferring NFT: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to add a user to the design
  const addUserToDesign = async () => {
    if (!contract || !nftData || !address || !userToAdd || !account) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      if (!userToAdd || !userToAdd.startsWith('0x') || userToAdd.length !== 42) {
        throw new Error('Please enter a valid Ethereum address');
      }
      
      // Call the add user function using contract.write
      const tx = await contract.write("addUserOfDesign", [nftData.id, userToAdd], { account });
      
      setSuccessMessage(`Successfully added user ${userToAdd} to design!`);
      
      // Update local data
      setNftData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          usersOfDesign: [...prev.usersOfDesign, userToAdd]
        };
      });
      
      // Reset add user form
      setUserToAdd('');
      setShowAddUserForm(false);
      
    } catch (err) {
      console.error("Error adding user to design:", err);
      setError(`Error adding user: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    
    // Reset form with current values if entering edit mode
    if (!isEditing && nftData) {
      setEditForm({
        designName: nftData.designName,
        fabricType: nftData.fabricType,
        designImage: nftData.designImage,
        prompt: nftData.prompt
      });
    }
  };
  
  // Handle edit form change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Function to truncate address for display
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Function to handle image error
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Function to check if URL is valid
  const isValidUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      // Check if it's a valid http or https URL
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };
  
  return (
    <div className="nft-viewer-editor">
      <h2>NFT Viewer/Editor</h2>
      
      <form onSubmit={handleSubmit} className="token-id-form">
        <div className="form-group">
          <label>Enter Token ID:</label>
          <input
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="e.g. 9"
            required
          />
        </div>
        
        <button type="submit" disabled={loading || !address}>
          {loading ? "Loading..." : "View NFT"}
        </button>
      </form>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {/* Debug Info */}
      <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        Contract: {contract ? 'Initialized' : 'Not initialized'} | 
        Address: {address ? 'Connected' : 'Not connected'} | 
        Token ID: {tokenId || 'None entered'}
      </div>
      
      {nftData && (
        <div className="nft-details">
          <h3>NFT Details (ID: {nftData.id})</h3>
          
          <div className="nft-card">
            {/* Image with better error handling */}
            {imageError || !nftData.designImage || !isValidUrl(nftData.designImage) ? (
              <div style={{
                width: '200px',
                height: '200px',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                {nftData.designImage ? 'Invalid Image URL' : 'No Image'}
              </div>
            ) : (
              <img 
                src={nftData.designImage}
                alt={nftData.designName}
                onError={handleImageError}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            )}
            
            <div className="nft-info">
              <div className="info-row">
                <span className="label">Design ID:</span>
                <span className="value">{nftData.designId}</span>
              </div>
              
              {isEditing ? (
                <>
                  <div className="info-row">
                    <span className="label">Design Name:</span>
                    <input
                      type="text"
                      name="designName"
                      value={editForm.designName}
                      onChange={handleEditChange}
                    />
                    <button 
                      onClick={() => updateMetadata('designName')}
                      disabled={loading}
                    >
                      Update
                    </button>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">Fabric Type:</span>
                    <input
                      type="text"
                      name="fabricType"
                      value={editForm.fabricType}
                      onChange={handleEditChange}
                    />
                    <button 
                      onClick={() => updateMetadata('fabricType')}
                      disabled={loading}
                    >
                      Update
                    </button>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">Design Image URL:</span>
                    <input
                      type="text"
                      name="designImage"
                      value={editForm.designImage}
                      onChange={handleEditChange}
                    />
                    <button 
                      onClick={() => updateMetadata('designImage')}
                      disabled={loading}
                    >
                      Update
                    </button>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">Prompt:</span>
                    <textarea
                      name="prompt"
                      value={editForm.prompt}
                      onChange={handleEditChange}
                    />
                    <button 
                      onClick={() => updateMetadata('prompt')}
                      disabled={loading}
                    >
                      Update
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="info-row">
                    <span className="label">Design Name:</span>
                    <span className="value">{nftData.designName}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">Fabric Type:</span>
                    <span className="value">{nftData.fabricType}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">Design Image URL:</span>
                    <span className="value">{nftData.designImage}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">Prompt:</span>
                    <span className="value">{nftData.prompt}</span>
                  </div>
                </>
              )}
              
              <div className="info-row">
                <span className="label">Owner:</span>
                <span className="value">{nftData.owner}</span>
              </div>
              
              {/* Previous Owners List */}
              <div className="info-row">
                <span className="label">Previous Owners:</span>
                <div className="value">
                  {nftData.previousOwners.length > 0 ? (
                    <ul className="address-list">
                      {nftData.previousOwners.map((prevOwner, index) => (
                        <li key={`prev-${index}`}>{truncateAddress(prevOwner)}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>No previous owners</span>
                  )}
                </div>
              </div>
              
              {/* Users of Design List */}
              <div className="info-row">
                <span className="label">Users of Design:</span>
                <div className="value">
                  {nftData.usersOfDesign.length > 0 ? (
                    <ul className="address-list">
                      {nftData.usersOfDesign.map((user, index) => (
                        <li key={`user-${index}`}>{truncateAddress(user)}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>No users added to this design</span>
                  )}
                </div>
              </div>
              
              {nftData.isOwner && (
                <div className="action-buttons">
                  <button 
                    onClick={toggleEditMode}
                    className="edit-toggle-btn"
                  >
                    {isEditing ? "Exit Edit Mode" : "Edit Metadata"}
                  </button>
                  
                  <button 
                    onClick={() => setShowTransferForm(!showTransferForm)}
                    className="transfer-btn"
                  >
                    {showTransferForm ? "Cancel Transfer" : "Transfer NFT"}
                  </button>
                  
                  <button 
                    onClick={() => setShowAddUserForm(!showAddUserForm)}
                    className="add-user-btn"
                  >
                    {showAddUserForm ? "Cancel Adding User" : "Add User to Design"}
                  </button>
                </div>
              )}
              
              {/* Transfer NFT Form */}
              {showTransferForm && nftData.isOwner && (
                <div className="transfer-form">
                  <h4>Transfer NFT</h4>
                  <div className="form-group">
                    <label>Recipient Address:</label>
                    <input
                      type="text"
                      value={transferToAddress}
                      onChange={(e) => setTransferToAddress(e.target.value)}
                      placeholder="0x..."
                      required
                    />
                  </div>
                  <button 
                    onClick={transferNFT}
                    disabled={loading || !transferToAddress}
                    className="transfer-submit-btn"
                  >
                    {loading ? "Processing..." : "Transfer NFT"}
                  </button>
                </div>
              )}
              
              {/* Add User Form */}
              {showAddUserForm && nftData.isOwner && (
                <div className="add-user-form">
                  <h4>Add User to Design</h4>
                  <div className="form-group">
                    <label>User Address:</label>
                    <input
                      type="text"
                      value={userToAdd}
                      onChange={(e) => setUserToAdd(e.target.value)}
                      placeholder="0x..."
                      required
                    />
                  </div>
                  <button 
                    onClick={addUserToDesign}
                    disabled={loading || !userToAdd}
                    className="add-user-submit-btn"
                  >
                    {loading ? "Processing..." : "Add User"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTViewerEditor;