// utils/getDesignIdStats.ts
import { ethers } from "ethers";

export async function getDesignIdStats(
  contract: ethers.Contract,
  designId: string
): Promise<{ totalMinted: number; totalListed: number }> {
  if (!designId || typeof designId !== "string") {
    throw new Error("Invalid design ID");
  }

  try {
    // Check if contract has required functions
    if (typeof contract.totalSupply !== "function") {
      throw new Error("Contract missing totalSupply function");
    }
    if (typeof contract.tokenByIndex !== "function") {
      throw new Error("Contract missing tokenByIndex function");
    }
    if (typeof contract.getDesignId !== "function") {
      throw new Error("Contract missing getDesignId function");
    }
    if (typeof contract.isNFTListed !== "function") {
      throw new Error("Contract missing isNFTListed function");
    }

    const totalSupplyBig = await contract.totalSupply();
    const totalSupply = totalSupplyBig.toNumber();

    console.log(`Scanning ${totalSupply} tokens for designId: ${designId}`);

    let totalMinted = 0;
    let totalListed = 0;

    for (let i = 0; i < totalSupply; i++) {
      try {
        const tokenIdBig = await contract.tokenByIndex(i);
        const tokenId = tokenIdBig.toNumber();

        const tokenDesignId = await contract.getDesignId(tokenId);

        if (tokenDesignId.toLowerCase() === designId.toLowerCase()) {
          // Case-insensitive
          totalMinted++;

          try {
            const isListed = await contract.isNFTListed(tokenId);
            if (isListed) {
              totalListed++;
            }
          } catch (listError) {
            console.warn(`isNFTListed failed for token ${tokenId}:`, listError);
          }
        }
      } catch {
        continue;
      }
    }

    return { totalMinted, totalListed };
  } catch (error) {
    console.error("getDesignIdStats error:", error);
    throw error;
  }
}
