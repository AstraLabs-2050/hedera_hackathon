# Astra Hedera Contracts - Detailed Implementation Documentation

## Overview
This document provides a comprehensive, step-by-step breakdown of the complete system implementation, including all function calls, smart contract interactions, payment flows, and state transitions.

**Contract Addresses:**
- `ASTRA_NFT_COLLECTIBLE_CONTRACT_ADDRESS`: `0x3da9616d78B6154D26B682e6F1e57aeaCDf2f3c1`
- `ESCROW_CONTRACT_ADDRESS`: `0x2679b381f17371982b126f93026Ea8a9b50120f7`

---

## System Architecture

### Contracts
1. **AstraNFTCollectible.sol** - NFT minting and marketplace
2. **Escrow.sol** - Milestone-based payment escrow system
3. **IAstraNFTCollectible.sol** - Interface for external contract interactions

### Key Roles
- **Shopper**: Buyer/consumer who purchases NFTs and creates escrows
- **Maker**: Designer/creator who mints NFTs and receives payments
- **Creator**: Optional co-creator who receives a share of payments
- **Agent**: Platform operator who manages escrows and completes milestones
- **Treasury**: Platform treasury receiving platform fees

### Payment Distribution Constants
```solidity
TOTAL_MILESTONES = 3
TREASURY_PERCENTAGE = 10%
MAKER_PERCENTAGE = 65% (when creator exists)
CREATOR_PERCENTAGE = 35% (when creator exists)
```

---

## Complete Workflow: End-to-End Implementation

### Phase 1: NFT Minting

#### Step 1.1: Approve USDC for Minting
**Contract:** `IHederaTokenService`
**Function:** `approve(address token, address spender, uint256 amount)`

**Call Details:**
```typescript
hederaTokenService.connect(maker).approve(
  usdcAddress,                                    // USDC token address
  astraNFTCollectibleAddress,                     // Contract to approve
  totalMintFee                                    // Amount: mintFee * quantity
)
```

**Parameters:**
- `token`: USDC token address (`0x0000000000000000000000000000000000068cda`)
- `spender`: AstraNFTCollectible contract address
- `amount`: Total fee for batch minting (e.g., `baseMintFee * 4` for 4 NFTs)

**State Changes:**
- Updates USDC allowance mapping: `allowance[maker][astraNFTCollectibleAddress] += totalMintFee`
- Emits `Approval` event

---

#### Step 1.2: Mint NFTs
**Contract:** `AstraNFTCollectible`
**Function:** `mintNFTs(address to, string memory designId, string memory designName, string memory designImage, string memory prompt, uint256 _count)`

**Call Details:**
```typescript
astraNFTCollectible.connect(maker).mintNFTs(
  maker.address,                                  // Recipient address
  `DESIGN_${Date.now()}`,                         // Unique design ID
  "Summer Collection Dress",                      // Design name
  "ipfs://QmExampleImageHash",                    // IPFS image hash
  "A beautiful summer dress...",                  // Prompt/description
  4                                               // Quantity to mint
)
```

**Internal Process:**
1. **Validation Checks:**
   - `totalMinted + _count <= MAX_SUPPLY` (max 100 NFTs)
   - `_count > 0 && _count <= MAX_PER_MINT` (max 10 per transaction)
   - `!_usedDesignIds[designId]` (design ID uniqueness)

2. **Payment Collection:**
   ```solidity
   // Check allowance
   hederaTokenService.allowance(usdcAddress, msg.sender, address(this))
   
   // Transfer payment from maker to treasury
   hederaTokenService.transferFrom(
     usdcAddress,
     msg.sender,
     treasuryAddress,
     totalFee
   )
   ```
   - Validates allowance is sufficient
   - Transfers USDC from maker to treasury
   - Emits `PaymentReceived(maker, totalFee)`

3. **Minting Loop:**
   For each NFT (0 to `_count`):
   - Increment token counter: `_tokenIdCounter.increment()`
   - Mint NFT: `_safeMint(to, tokenId)`
   - Set metadata:
     ```solidity
     _tokenMetadata[tokenId] = {
       designId: designId,
       designName: designName,
       designImage: designImage,
       prompt: prompt,
       previousOwners: [],
       usersOfDesign: []
     }
     ```
   - Mark design ID as used: `_usedDesignIds[designId] = true`
   - Emit `NFTMinted(tokenId, to, designId, designName, designImage, prompt)`

**State Changes:**
- `_tokenIdCounter` incremented by `_count`
- `_ownerOf[tokenId] = maker.address` for each token
- `_tokenMetadata[tokenId]` populated
- `_usedDesignIds[designId] = true`
- `balanceOf[maker.address] += _count`
- USDC transferred: `treasuryAddress.balance += totalFee`

**Events Emitted:**
- `NFTMinted` for each NFT minted
- `PaymentReceived(maker, totalFee)`
- `Transfer` events (from OpenZeppelin ERC721)

**Return Value:**
- Transaction receipt with `NFTMinted` events containing token IDs

---

### Phase 2: NFT Listing

#### Step 2.1: List NFTs by Quantity
**Contract:** `AstraNFTCollectible`
**Function:** `listOwnedNFTsByQuantity(uint256 quantity, uint256 price)`

**Call Details:**
```typescript
astraNFTCollectible.connect(maker).listOwnedNFTsByQuantity(
  3,                                              // Quantity to list
  ethers.parseUnits("1", 6)                       // Price: 1 USDC (6 decimals)
)
```

**Internal Process:**
1. **Validation:**
   - `quantity > 0 && quantity <= 20` (gas limit protection)
   - `price > 0`

2. **Fetch Owned NFTs:**
   ```solidity
   uint256[] memory ownedTokens = tokensOfOwner(_msgSender())
   // Returns array of token IDs owned by maker
   ```

3. **Count Available NFTs:**
   - Iterate through `ownedTokens`
   - Count NFTs where `!_listings[tokenId].isActive`
   - Require `availableCount >= quantity`

4. **Collect Unlisted Token IDs:**
   - Build array of unlisted token IDs
   - Maximum `quantity` items

5. **List Each NFT:**
   For each token ID:
   ```solidity
   // Transfer NFT to escrow contract
   _transfer(_msgSender(), escrowAddress, tokenId)
   
   // Create listing
   _listings[tokenId] = NFTListing({
     tokenId: tokenId,
     seller: _msgSender(),        // Maker's address
     price: price,                // 1 USDC
     isActive: true,
     listingTime: block.timestamp
   })
   
   // Update tracking arrays
   _activeListings.push(tokenId)
   _sellerListings[_msgSender()].push(tokenId)
   ```

**State Changes:**
- `_ownerOf[tokenId] = escrowAddress` (NFT ownership transferred to escrow)
- `balanceOf[maker.address] -= quantity`
- `balanceOf[escrowAddress] += quantity`
- `_listings[tokenId]` created for each listed NFT
- `_activeListings` array appended
- `_sellerListings[maker]` array appended

**Events Emitted:**
- `NFTListed(tokenId, seller, price, listingTime)` for each NFT
- `Transfer(from: maker, to: escrowAddress, tokenId)` for each NFT

**Alternative: Single NFT Listing**
```typescript
astraNFTCollectible.connect(maker).listNFT(
  tokenId,                                        // Specific token ID
  ethers.parseUnits("1", 6)                       // Price
)
```

---

#### Step 2.2: Query Listing Details
**Contract:** `AstraNFTCollectible`
**Functions:** `getListing()`, `getActiveListings()`, `isNFTListed()`

**Call Examples:**
```typescript
// Get specific listing
const listing = await astraNFTCollectible.getListing(tokenId)
// Returns: { tokenId, seller, price, isActive, listingTime }

// Check if listed
const isListed = await astraNFTCollectible.isNFTListed(tokenId)
// Returns: boolean

// Get all active listings
const activeListings = await astraNFTCollectible.getActiveListings()
// Returns: uint256[] array of token IDs
```

---

### Phase 3: Escrow Creation

#### Step 3.1: Approve USDC for Escrow Deposit
**Contract:** `IHederaTokenService`
**Function:** `approve(address token, address spender, uint256 amount)`

**Call Details:**
```typescript
hederaTokenService.connect(shopper).approve(
  usdcAddress,                                    // USDC token
  escrowAddress,                                  // Escrow contract
  escrowAmount                                    // Amount: 1 USDC
)
```

**State Changes:**
- `allowance[shopper][escrowAddress] += escrowAmount`

---

#### Step 3.2: Deposit Funds for Escrow
**Contract:** `Escrow`
**Function:** `depositFunds(uint256 amount, address agent)`

**Call Details:**
```typescript
escrow.connect(shopper).depositFunds(
  ethers.parseUnits("1", 6),                      // Amount: 1 USDC
  agent.address                                   // Agent address
)
```

**Internal Process:**
1. **Validation:**
   - `amount > 0`
   - `agent != address(0)`

2. **USDC Transfer:**
   ```solidity
   hederaTokenService.transferFrom(
     usdcAddress,
     msg.sender,      // Shopper
     address(this),   // Escrow contract
     amount
   )
   ```

3. **Update Deposit Balance:**
   ```solidity
   deposits[shopper][agent] += amount
   ```

**State Changes:**
- `deposits[shopper][agent] += escrowAmount`
- USDC balance: `escrowContract.balance += escrowAmount`
- Shopper's USDC balance decreased

**Events Emitted:**
- `FundsDeposited(shopper, agent, amount)`

---

#### Step 3.3: Create Escrow
**Contract:** `Escrow`
**Function:** `createEscrowByAgent(address shopper, address maker, address creator, uint256 amount, uint256 nftTokenId)`

**Call Details:**
```typescript
escrow.connect(agent).createEscrowByAgent(
  shopper.address,                                // Shopper address
  maker.address,                                  // Maker address
  creator.address,                                // Creator (can be zero address)
  ethers.parseUnits("1", 6),                      // Escrow amount: 1 USDC
  cosmicTokenId                                   // NFT token ID to escrow
)
```

**Internal Process:**
1. **Validation:**
   - `shopper != address(0)`
   - `maker != address(0)`
   - `deposits[shopper][agent] >= amount`
   - `amount > 0`

2. **Deduct Deposit:**
   ```solidity
   deposits[shopper][agent] -= amount
   ```

3. **Create Escrow Record:**
   ```solidity
   uint256 escrowId = nextEscrowId++  // Auto-increment
   
   EscrowData memory _escrowData = EscrowData({
     shopper: shopper,
     maker: maker,
     creator: creator,
     agent: agent,
     amount: amount,                    // 1 USDC
     nftTokenId: nftTokenId,
     milestonesCompleted: 0,
     status: STATUS_SHOPPER_DETAILS_RECEIVED,  // "ShopperDetailsReceived"
     remainingBalance: amount,          // 1 USDC
     hasCreator: creator != address(0)
   })
   ```

4. **Store Escrow:**
   ```solidity
   escrows[escrowId] = _escrowData
   allEscrows.push(_escrowData)
   shopperEscrows[shopper].push(escrowId)
   ```

**State Changes:**
- `deposits[shopper][agent] -= amount`
- `escrows[escrowId]` created
- `allEscrows[]` appended
- `shopperEscrows[shopper][]` appended
- `nextEscrowId++`

**Events Emitted:**
- `EscrowCreated(escrowId, shopper, maker, treasuryAddress, amount, nftTokenId)`

**Important Note:**
- NFT must already be listed and owned by escrow contract
- NFT ownership remains with escrow until milestones complete

---

### Phase 4: Milestone Completion & Payment Distribution

#### Step 4.1: Complete Milestone 1 (Shopper Details → Outfit Made)
**Contract:** `Escrow`
**Function:** `completeMilestoneByAgent(uint256 escrowId)`

**Call Details:**
```typescript
escrow.connect(agent).completeMilestoneByAgent(escrowId)
```

**Internal Process:**
1. **Validation:**
   - `escrow.agent == msg.sender` (only agent can complete)
   - `escrow.milestonesCompleted < TOTAL_MILESTONES` (max 3)

2. **Calculate Payment Distribution:**
   ```solidity
   treasuryShare = (amount * 10) / 100  // 10% = 0.1 USDC
   
   if (!escrow.hasCreator) {
     // No creator: Maker gets 90% / 3 milestones
     paymentAmount = (amount - treasuryShare) / 3
     // paymentAmount = (1 - 0.1) / 3 = 0.3 USDC
   } else {
     // With creator: Split between maker and creator
     makerShare = (amount * 65) / 100 / 3    // 65% / 3 = 0.2167 USDC
     creatorPayment = (amount * 35) / 100 / 3 // 35% / 3 = 0.1167 USDC
   }
   ```

3. **Process Payment:**
   **Scenario A: No Creator**
   ```solidity
   // Deduct from remaining balance
   escrow.remainingBalance -= paymentAmount  // 1 - 0.3 = 0.7 USDC
   
   // Transfer to maker
   hederaTokenService.transferToken(
     usdcAddress,
     address(this),      // From escrow
     escrow.maker,       // To maker
     paymentAmount       // 0.3 USDC
   )
   ```

   **Scenario B: With Creator**
   ```solidity
   // Deduct from remaining balance
   escrow.remainingBalance -= (makerShare + creatorPayment)
   // 1 - 0.2167 - 0.1167 = 0.6666 USDC
   
   // Transfer to maker
   hederaTokenService.transferToken(usdcAddress, address(this), escrow.maker, makerShare)
   
   // Transfer to creator
   hederaTokenService.transferToken(usdcAddress, address(this), escrow.creator, creatorPayment)
   ```

4. **Update Milestone:**
   ```solidity
   escrow.milestonesCompleted++  // Now = 1
   escrow.status = STATUS_OUTFIT_MADE  // "OutfitMade"
   ```

**State Changes:**
- `escrow.milestonesCompleted = 1`
- `escrow.status = "OutfitMade"`
- `escrow.remainingBalance` decreased by payment amount
- USDC transferred to maker (and creator if exists)

**Events Emitted:**
- `PaymentReleased(escrowId, recipient, amount)` for each payment
- `MilestoneCompleted(escrowId, 1, "OutfitMade")`

---

#### Step 4.2: Complete Milestone 2 (Outfit Made → Outfit Delivered)
**Contract:** `Escrow`
**Function:** `completeMilestoneByAgent(uint256 escrowId)`

**Process:** Identical to Step 4.1

**Payment Distribution:**
- Same calculation as Milestone 1
- Another 0.3 USDC to maker (or 0.2167/0.1167 split)

**State Changes:**
- `escrow.milestonesCompleted = 2`
- `escrow.status = "OutfitDelivered"`
- `escrow.remainingBalance` further decreased

---

#### Step 4.3: Complete Milestone 3 (Final - Outfit Delivered → Complete)
**Contract:** `Escrow`
**Function:** `completeMilestoneByAgent(uint256 escrowId)`

**Call Details:**
```typescript
escrow.connect(agent).completeMilestoneByAgent(escrowId)
```

**Internal Process:**
1. **Standard Payment Distribution:**
   - Same payment calculation and transfer as previous milestones
   - Final milestone payment released

2. **Finalize Escrow:**
   ```solidity
   escrow.milestonesCompleted = 3
   escrow.status = STATUS_COMPLETE  // "Complete"
   ```

3. **Treasury Payment:**
   ```solidity
   if (!escrow.hasCreator) {
     // Transfer 10% treasury share
     hederaTokenService.transferToken(
       usdcAddress,
       address(this),
       treasuryAddress,
       treasuryShare  // 0.1 USDC
     )
   } else {
     // Transfer remaining balance (dust) to treasury
     hederaTokenService.transferToken(
       usdcAddress,
       address(this),
       treasuryAddress,
       escrow.remainingBalance
     )
     escrow.remainingBalance = 0
   }
   ```

4. **NFT Transfer to Shopper:**
   ```solidity
   IAstraNFTCollectible(astraNFTCollectibleAddress).transferNFT(
     escrow.shopper,    // Transfer to shopper
     escrow.nftTokenId  // NFT token ID
   )
   ```

**NFT Transfer Internal Process:**
The `transferNFT` function in `AstraNFTCollectible`:
1. Calls internal `_transfer(escrowAddress, shopper, tokenId)`
2. The `_transfer` hook automatically:
   - Unlists the NFT if it was listed
   - Updates ownership mappings
   - Emits `Transfer` event
   - Emits `NFTUnlisted` event (if was listed)

**Complete Payment Summary (No Creator):**
```
Total Escrow: 1.0 USDC
├─ Milestone 1: 0.3 USDC → Maker
├─ Milestone 2: 0.3 USDC → Maker
├─ Milestone 3: 0.3 USDC → Maker
└─ Treasury: 0.1 USDC → Treasury
   Total: 1.0 USDC
```

**Complete Payment Summary (With Creator):**
```
Total Escrow: 1.0 USDC
├─ Milestone 1: 0.2167 USDC → Maker, 0.1167 USDC → Creator
├─ Milestone 2: 0.2167 USDC → Maker, 0.1167 USDC → Creator
├─ Milestone 3: 0.2167 USDC → Maker, 0.1167 USDC → Creator
└─ Remaining: ~0.0002 USDC → Treasury (dust)
   Total: 1.0 USDC
```

**State Changes:**
- `escrow.milestonesCompleted = 3`
- `escrow.status = "Complete"`
- `escrow.remainingBalance = 0` (or minimal dust)
- `_ownerOf[nftTokenId] = shopper.address`
- `balanceOf[escrowAddress] -= 1`
- `balanceOf[shopper.address] += 1`
- `_listings[nftTokenId].isActive = false` (if was listed)
- NFT removed from `_activeListings` array

**Events Emitted:**
- `PaymentReleased(escrowId, maker, amount)`
- `PaymentReleased(escrowId, creator, amount)` (if creator exists)
- `PaymentReleased(escrowId, treasuryAddress, amount)`
- `MilestoneCompleted(escrowId, 3, "Complete")`
- `Transfer(escrowAddress, shopper, tokenId)`
- `NFTUnlisted(tokenId, escrowAddress)` (if was listed)

---

### Phase 5: Query & Verification Functions

#### Query Functions

**Escrow Contract:**
```typescript
// Get escrow details
const details = await escrow.getEscrowDetails(escrowId)
// Returns: {
//   shopper, maker, creator, agent,
//   amount, nftTokenId, milestonesCompleted,
//   status, remainingBalance, hasCreator
// }

// Get remaining balance
const balance = await escrow.getEscrowBalance(escrowId)

// Get all escrows
const allEscrows = await escrow.getAllEscrows()

// Get shopper's escrows
const shopperEscrows = await escrow.getShopperEscrows(shopper.address)

// Get deposit balance
const deposit = await escrow.getDepositBalance(shopper.address, agent.address)
```

**AstraNFTCollectible Contract:**
```typescript
// Get NFT metadata
const designId = await astraNFTCollectible.getDesignId(tokenId)
const designName = await astraNFTCollectible.getDesignName(tokenId)
const prompt = await astraNFTCollectible.getPrompt(tokenId)

// Get ownership
const owner = await astraNFTCollectible.ownerOf(tokenId)
const balance = await astraNFTCollectible.balanceOf(owner)

// Get owned NFTs
const ownedTokens = await astraNFTCollectible.tokensOfOwner(owner)

// Get listing info
const listing = await astraNFTCollectible.getListing(tokenId)
const isListed = await astraNFTCollectible.isNFTListed(tokenId)
const activeListings = await astraNFTCollectible.getActiveListings()
const sellerListings = await astraNFTCollectible.getSellerListings(seller)
```

---

## State Transition Diagrams

### Escrow Status Flow
```
ShopperDetailsReceived (0 milestones)
    ↓ completeMilestoneByAgent()
OutfitMade (1 milestone)
    ↓ completeMilestoneByAgent()
OutfitDelivered (2 milestones)
    ↓ completeMilestoneByAgent()
Complete (3 milestones) + NFT Transfer
```

### NFT Ownership Flow
```
Maker mints NFT
    → Maker owns NFT
    ↓ listNFT() or listOwnedNFTsByQuantity()
Escrow Contract owns NFT (listed)
    ↓ completeMilestoneByAgent() milestone 3
Shopper owns NFT (escrow complete)
```

### Payment Flow (No Creator)
```
Shopper deposits 1.0 USDC
    → Escrow contract holds 1.0 USDC
    ↓ Milestone 1
Maker receives 0.3 USDC | Remaining: 0.7 USDC
    ↓ Milestone 2
Maker receives 0.3 USDC | Remaining: 0.4 USDC
    ↓ Milestone 3
Maker receives 0.3 USDC | Treasury receives 0.1 USDC | Remaining: 0 USDC
```

---

## Security Features

### Reentrancy Protection
- Both contracts use `nonReentrant` modifier on state-changing functions
- All payment transfers protected by ReentrancyGuard

### Access Control
- `completeMilestoneByAgent()`: Only escrow agent can call
- `createEscrowByAgent()`: Only agents can create escrows
- `updateTreasuryAddress()`: Only contract owner
- `updateAstraNFTCollectibleAddress()`: Only contract owner
- NFT listing: Only owner or approved operator

### Validation
- Zero address checks
- Amount > 0 checks
- Balance/allowance verification
- Milestone limit enforcement
- Design ID uniqueness enforcement

---

## Event Tracking

### Key Events for Monitoring

1. **NFTMinted**: Track all NFT creations
2. **NFTListed**: Track marketplace listings
3. **FundsDeposited**: Track escrow deposits
4. **EscrowCreated**: Track new escrows
5. **PaymentReleased**: Track all payments
6. **MilestoneCompleted**: Track milestone progress
7. **Transfer**: Track NFT ownership changes

---

## Gas Optimization Notes

- Batch operations supported (up to 20 NFTs in `listOwnedNFTsByQuantity`)
- Efficient storage patterns (packed structs where possible)
- Minimal external calls within loops
- Pre-validation before state changes

---

## Error Handling

### Common Reverts
- `InvalidAmount`: Amount is zero or invalid
- `InvalidAddress`: Zero address provided
- `InsufficientBalance`: Not enough funds/allowance
- `Unauthorized`: Caller not authorized
- `MilestoneLimitReached`: All milestones already completed
- `TokenTransferFailed`: Hedera token transfer failed
- `DepositFailed`: Deposit transaction failed

