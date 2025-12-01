# Astra Marketplace - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [User Stories](#user-stories)
3. [System Context](#system-context)
4. [Flow Diagrams](#flow-diagrams)

---

## System Overview

The Astra Marketplace is a blockchain-based escrow service that enables secure transactions between customers and makers. The platform supports two types of customers:

1. **Crypto Users**: Customers with crypto wallets who can directly interact with smart contracts
2. **Non-Crypto Users**: Customers without wallets who pay with fiat currency, which is automatically converted and deposited into escrow. The platform can create custodial wallets for non-crypto users to manage escrow creation and fund releases on their behalf.

The platform facilitates:
- Order creation and fund escrow
- Milestone-based fund releases
- Fiat-to-crypto conversion for non-crypto users
- Custodial wallet management for non-crypto users
- Crypto-to-fiat offramp for makers

### Key Features
- **Dual Payment Support**: Direct crypto deposits and fiat-to-crypto conversion
- **Smart Contract Escrow**: Decentralized fund management on blockchain
- **Automated Settlement**: Backend automation for non-crypto user payments
- **Custodial Wallets**: Backend-managed wallets for non-crypto users to enable escrow operations
- **Multi-Currency Support**: NGN, USD, EUR (fiat) and USDC, cNGN (stablecoin)
- **Offramp Integration**: Crypto-to-fiat conversion for maker withdrawals via treasury transfer

---

## User Stories

### Customer Stories

#### US-1: Crypto Customer Places Order
**As a** crypto user with a wallet  
**I want to** place an order and deposit funds directly to escrow  
**So that** I can securely transact with makers using my crypto assets

**Acceptance Criteria:**
- Customer can connect their wallet to the application
- Customer can create an escrow order via smart contract
- Customer can deposit funds directly to the escrow contract
- Order creation and deposit events are emitted and stored

#### US-2: Non-Crypto Customer Places Order
**As a** customer without a crypto wallet  
**I want to** pay with fiat currency (credit card, bank transfer, mobile money)  
**So that** I can use the escrow service without needing crypto knowledge

**Acceptance Criteria:**
- Customer can place an order without wallet connection
- Customer is redirected to Flutterwave payment page
- Payment can be made in NGN, USD, or EUR
- Backend automatically converts fiat to crypto
- Backend creates a custodial wallet for the customer (if not already exists)
- Backend creates escrow using the custodial wallet address
- Customer receives confirmation of order creation

#### US-3: Customer Releases Funds
**As a** customer  
**I want to** release funds to the maker when milestones are completed  
**So that** I can pay for completed work

**Acceptance Criteria:**
- Customer can view order status and milestones
- Customer can approve fund release for completed milestones
- For crypto users: Funds are released directly from escrow to maker's wallet via customer's wallet
- For non-crypto users: Backend releases funds from escrow using the custodial wallet on customer's behalf
- Transaction is recorded on blockchain

### Maker Stories

#### US-4: Maker Withdraws Funds
**As a** maker with a crypto wallet  
**I want to** withdraw my earnings to my bank account in fiat currency  
**So that** I can receive payment in my local currency

**Acceptance Criteria:**
- Maker can connect wallet and view available balance
- Maker can select withdrawal currency (NGN, KES, etc.)
- Maker can input bank account details
- Maker transfers USDC from their wallet to backend's treasury address
- Backend detects treasury transfer and initiates offramp order with PayCrest
- Maker receives fiat currency in bank account or crypto refund if failed

#### US-5: Maker Views Orders
**As a** maker  
**I want to** view my active orders and milestones  
**So that** I can track my work progress and payments

**Acceptance Criteria:**
- Maker can see all assigned orders
- Maker can view milestone status
- Maker can see available balance for withdrawal

---

## System Context

```mermaid
C4Context
    title System Context diagram for Astra Marketplace System
    
    Enterprise_Boundary(b0, "EscrowPlatformBoundary") {
        Person(customerCrypto, "Customer (Crypto User)", "A customer with a crypto wallet who can directly interact with the escrow contract.")
        Person(customerNonCrypto, "Customer (Non-Crypto User)", "A customer without a crypto wallet who pays with fiat currency.")
        Person(maker, "Maker", "A crypto user who completes work and withdraws funds.")
        
        System(mainApp, "Astra Marketplace Application", "Allows customers to place orders and makers to withdraw funds. Handles wallet connections and order management.")
        
        Enterprise_Boundary(b1, "PlatformBoundary") {
            System(backend, "Backend System", "Monitors webhook events from payment providers, creates custodial wallets for non-crypto customers, creates escrow orders on behalf of non-crypto customers, and initiates offramp orders for makers.")
            
            SystemDb(escrowContract, "Escrow Smart Contract", "Stores escrow orders, manages deposits, and handles fund releases. Emits events for order creation and fund deposits.")
            
            SystemDb(custodialWallets, "Custodial Wallet Service", "Manages wallet creation, private key storage (HSM/KMS), and transaction signing on behalf of non-crypto users.")
        }
        
        Enterprise_Boundary(b2, "PaymentProvidersBoundary") {
            System_Ext(flutterwave, "Flutterwave", "Payment gateway that processes fiat payments (NGN, USD, EUR) via credit card, bank transfer, mobile money, etc. Settles in NGN/cNGN to Blockradar.")
            
            System_Ext(blockradar, "Blockradar", "Virtual account service that receives NGN/cNGN from Flutterwave and auto-settles in USDC to treasury address.")
            
            System_Ext(paycrest, "PayCrest", "Offramp service that converts crypto to fiat currency and sends funds to maker's bank account or refunds to wallet.")
        }
    }
    
    Rel(customerCrypto, mainApp, "Connects wallet")
    Rel(customerCrypto, mainApp, "Places order")
    Rel(mainApp, escrowContract, "Creates escrow & deposits funds", "createEscrow, depositFunds")
    Rel(escrowContract, customerCrypto, "Emits events", "OrderCreated, FundsDeposited")
    
    Rel(customerNonCrypto, mainApp, "Places order")
    Rel(mainApp, flutterwave, "Redirects to payment page")
    Rel(customerNonCrypto, flutterwave, "Pays with fiat", "Credit card, bank transfer, mobile money")
    Rel(flutterwave, backend, "Sends webhook", "Payment successful event")
    Rel(flutterwave, blockradar, "Settles in NGN/cNGN")
    Rel(blockradar, backend, "Sends webhook", "USDC settlement event")
    Rel(backend, custodialWallets, "Creates custodial wallet for customer")
    Rel(backend, escrowContract, "Creates escrow & deposits funds using custodial wallet", "createEscrow, depositFunds")
    Rel(custodialWallets, escrowContract, "Signs transactions on behalf of customer", "releaseFunds")
    
    Rel(maker, mainApp, "Connects wallet")
    Rel(maker, mainApp, "Requests withdrawal")
    Rel(mainApp, backend, "Initiates withdrawal")
    Rel(maker, escrowContract, "Transfers USDC to treasury address")
    Rel(escrowContract, backend, "Detects treasury transfer", "USDC Transfer event")
    Rel(backend, paycrest, "Creates offramp order", "Fetch rate, verify account, create order")
    Rel(paycrest, maker, "Sends fiat to bank account or refunds crypto to wallet")
```

---

## Flow Diagrams

### Customer Journey: Crypto User

```mermaid
sequenceDiagram
    participant C as Crypto Customer
    participant App as Astra Marketplace App
    participant Wallet as Customer Wallet
    participant Contract as Escrow Contract
    participant Maker as Maker
    
    C->>App: Connect Wallet
    App->>Wallet: Request Connection
    Wallet-->>App: Wallet Connected
    App-->>C: Wallet Connected
    
    C->>App: Click "Place Order"
    App->>C: Show Order Form
    C->>App: Submit Order Details
    
    App->>Contract: createEscrow(orderId, customerAddress, makerAddress, amount)
    Contract-->>App: Escrow Created Event
    
    App->>Wallet: Request Approval: depositFunds(amount)
    Wallet->>C: Show Transaction Approval
    C->>Wallet: Approve Transaction
    Wallet->>Contract: depositFunds(orderId, amount)
    Contract-->>Wallet: Transaction Receipt
    Contract->>Contract: Emit FundsDeposited Event
    Contract-->>App: Event: FundsDeposited(orderId, customerAddress, amount)
    
    App->>App: Store Order (orderId, customerAddress, status)
    App-->>C: Order Created & Funds Deposited
    
    Note over C,Maker: Customer communicates with Maker
    
    Maker->>Maker: Complete Milestone
    Maker->>App: Mark Milestone Complete
    App->>C: Notify: Milestone Complete
    
    C->>App: Approve Release
    App->>Wallet: Request Approval: releaseFunds(orderId, milestoneId)
    Wallet->>C: Show Transaction Approval
    C->>Wallet: Approve Transaction
    Wallet->>Contract: releaseFunds(orderId, milestoneId, amount)
    Contract->>Maker: Transfer Funds to Maker Wallet
    Contract-->>App: Event: FundsReleased(orderId, makerAddress, amount)
    App-->>C: Funds Released to Maker
```

### Customer Journey: Non-Crypto User

```mermaid
sequenceDiagram
    participant C as Non-Crypto Customer
    participant App as Astra Marketplace App
    participant FW as Flutterwave
    participant BR as Blockradar
    participant Backend as Backend System
    participant Contract as Escrow Contract
    participant Treasury as Treasury Wallet
    participant CustodialWallet as Custodial Wallet
    
    C->>App: Click "Place Order"
    App->>C: Show Order Form
    C->>App: Submit Order Details (fiat amount, currency)
    App->>App: Generate Order ID
    App->>FW: Redirect to Payment Page (orderId, amount, currency, customerID)
    
    C->>FW: Pay with Fiat (Credit Card/Bank Transfer/Mobile Money)
    FW->>FW: Process Payment
    FW->>FW: Convert to NGN/cNGN
    FW->>BR: Settle NGN/cNGN to Blockradar Virtual Account
    FW->>Backend: Webhook: Payment Successful (customerID, orderId, amount, currency)
    
    Backend->>Backend: Store Payment Record (customerID, orderId, status: pending_settlement)
    
    BR->>BR: Receive NGN/cNGN
    BR->>Treasury: Auto-settle NGN/cNGN → USDC
    BR->>Backend: Webhook: USDC Settlement Complete (orderId, usdcAmount, treasuryAddress)
    
    Backend->>Backend: Update Payment Record (status: settled)
    
    alt Custodial Wallet Does Not Exist
        Backend->>Backend: Create Custodial Wallet for Customer
        Backend->>Backend: Store Custodial Wallet (customerID, walletAddress)
    end
    
    Backend->>Treasury: Transfer USDC to Custodial Wallet (usdcAmount)
    Treasury->>CustodialWallet: Transfer USDC
    
    Backend->>Contract: createEscrow(orderId, custodialWalletAddress, makerAddress, usdcAmount)
    Contract-->>Backend: Escrow Created Event
    
    Backend->>CustodialWallet: Approve USDC for Escrow Contract
    Backend->>Contract: depositFunds(orderId, usdcAmount) [from Custodial Wallet]
    Contract->>Contract: Emit FundsDeposited Event
    Contract-->>Backend: Event: FundsDeposited(orderId, custodialWalletAddress, usdcAmount)
    
    Backend->>Backend: Store Order (orderId, customerID, custodialWalletAddress, status: active)
    Backend->>App: Notify: Order Created
    App-->>C: Order Created & Funds in Escrow
```

### Maker Journey: Withdraw Funds

```mermaid
sequenceDiagram
    participant M as Maker
    participant App as Astra Marketplace App
    participant Wallet as Maker Wallet
    participant Backend as Backend System
    participant Treasury as Treasury Wallet
    participant PC as PayCrest
    participant Bank as Maker Bank Account
    
    M->>App: Connect Wallet
    App->>Wallet: Request Connection
    Wallet-->>App: Wallet Connected
    App-->>M: Wallet Connected
    
    M->>App: Click "Withdraw Funds"
    App->>App: Fetch Available Balance
    App-->>M: Show Available Balance
    
    M->>App: Select Fiat Currency (NGN, KES, etc.)
    M->>App: Input Withdrawal Details (bank account, amount)
    App->>Backend: Initiate Withdrawal Request (makerAddress, amount, currency, bankDetails)
    
    Backend->>PC: Fetch Exchange Rate (cryptoAmount, targetCurrency)
    PC-->>Backend: Exchange Rate & Fees (if applicable)
    
    Backend->>Backend: Calculate Final Amount
    Backend->>PC: Verify Bank Account (accountNumber, bankCode, currency)
    PC-->>Backend: Account Verification Result
    
    alt Account Verified
        Backend->>Backend: Store Withdrawal Record (withdrawalId, makerAddress, amount, currency, bankDetails, status: pending_transfer)
        Backend->>App: Return Treasury Address & Withdrawal ID
        App-->>M: Show Treasury Address & Transfer Instructions
        
        M->>Wallet: Transfer USDC to Treasury Address (amount, withdrawalId as memo)
        Wallet->>Treasury: Transfer USDC (amount)
        Treasury->>Backend: Event: USDC Received (makerAddress, amount, withdrawalId)
        
        Backend->>Backend: Update Withdrawal Record (status: transfer_received)
        Backend->>PC: Create Offramp Order (treasuryAddress, amount, currency, bankDetails, withdrawalId)
        PC-->>Backend: Order Created (paycrestOrderId, status)
        
        Backend->>Backend: Update Withdrawal Record (paycrestOrderId, status: processing)
        
        PC->>PC: Process Offramp
        
        alt Offramp Successful
            PC->>Bank: Transfer Fiat Currency
            PC->>Backend: Webhook: Order Completed (paycrestOrderId, status: success)
            Backend->>Backend: Update Withdrawal Record (status: completed)
            Backend->>App: Notify: Withdrawal Successful
            App-->>M: Funds Sent to Bank Account
        else Offramp Failed
            PC->>Wallet: Refund Crypto to Maker Wallet
            PC->>Backend: Webhook: Order Failed (paycrestOrderId, status: failed, reason)
            Backend->>Backend: Update Withdrawal Record (status: failed, refunded: true)
            Backend->>App: Notify: Withdrawal Failed - Refunded
            App-->>M: Withdrawal Failed - Crypto Refunded to Wallet
        end
    else Account Verification Failed
        Backend->>App: Notify: Account Verification Failed
        App-->>M: Invalid Bank Account Details
    end
```

### Backend Webhook Processing Flow

```mermaid
sequenceDiagram
    participant FW as Flutterwave
    participant BR as Blockradar
    participant PC as PayCrest
    participant Backend as Backend System
    participant Queue as Message Queue
    participant Worker as Webhook Worker
    participant Contract as Escrow Contract
    participant DB as Database
    
    FW->>Backend: POST /webhooks/flutterwave (payment event)
    Backend->>Queue: Publish Payment Event
    Backend-->>FW: 200 OK
    
    BR->>Backend: POST /webhooks/blockradar (settlement event)
    Backend->>Queue: Publish Settlement Event
    Backend-->>BR: 200 OK
    
    PC->>Backend: POST /webhooks/paycrest (offramp event)
    Backend->>Queue: Publish Offramp Event
    Backend-->>PC: 200 OK
    
    Worker->>Queue: Consume Payment Event
    Worker->>DB: Store Payment Record
    Worker->>DB: Update Order Status
    
    Worker->>Queue: Consume Settlement Event
    Worker->>DB: Update Payment Status (settled)
    Worker->>Contract: createEscrow()
    Worker->>Contract: depositFunds()
    Worker->>DB: Store Escrow Order
    
    Worker->>Queue: Consume Offramp Event
    Worker->>DB: Update Withdrawal Status
    alt Success
        Worker->>DB: Mark Withdrawal Complete
    else Failure
        Worker->>DB: Mark Withdrawal Failed & Refunded
    end
```
