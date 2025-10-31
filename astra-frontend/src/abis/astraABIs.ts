export const tokenServiceABI = [
  "function associateTokens(address account, address[] tokens) external returns (int64 responseCode)",
  "function transferToken(address token, address sender, address receiver, int64 amount) external returns (int64 responseCode)",
];

export const contractABI = [
  "function getBaseMintFee() external view returns (uint256)",
  "function MAX_PER_MINT() external view returns (uint256)",
];

export const listingABI = [
  "function tokensOfOwner(address owner) external view returns (uint256[] memory)",
  "function transferNFT(address to, uint256 tokenId) external",
  "function getDesignId(uint256 tokenId) external view returns (string memory)",
];

export const astraNFTABI = [
  "function totalSupply() external view returns (uint256)",
  "function tokenByIndex(uint256 index) external view returns (uint256)",
  "function getDesignId(uint256 tokenId) external view returns (string memory)",
  "function isNFTListed(uint256 tokenId) external view returns (bool)",
];
