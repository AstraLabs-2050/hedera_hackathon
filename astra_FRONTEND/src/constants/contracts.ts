// Contract addresses - UPDATED with correct deployed addresses from your logs
export const ESCROW_ADDRESS = '0x51C6BE6D711fb86FCdEa43d26a8caedC7B0BaF79';
export const USDC_ADDRESS = '0xab7a91192dC9df70bF148B8a208585461A3081D9';

// ERC20 (USDC) ABI as proper JSON format
export const ERC20_ABI = [
    {
        "inputs": [{ "name": "_account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "_spender", "type": "address" },
            { "name": "_amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "_owner", "type": "address" },
            { "name": "_spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "_to", "type": "address" },
            { "name": "_amount", "type": "uint256" }
        ],
        "name": "mint",
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

// Updated Escrow Contract ABI as proper JSON format
export const ESCROW_ABI = [
    {
        "inputs": [
            { "name": "amount", "type": "uint256" },
            { "name": "agent", "type": "address" }
        ],
        "name": "depositFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "shopper", "type": "address" },
            { "name": "maker", "type": "address" },
            { "name": "treasury", "type": "address" },
            { "name": "creator", "type": "address" },
            { "name": "amount", "type": "uint256" }
        ],
        "name": "createEscrowByAgent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "escrowId", "type": "uint256" }
        ],
        "name": "completeMilestoneByAgent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "shopper", "type": "address" },
            { "name": "agent", "type": "address" }
        ],
        "name": "getDepositBalance",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "escrowId", "type": "uint256" }
        ],
        "name": "getEscrowDetails",
        "outputs": [
            {
                "components": [
                    { "name": "shopper", "type": "address" },
                    { "name": "maker", "type": "address" },
                    { "name": "creator", "type": "address" },
                    { "name": "treasury", "type": "address" },
                    { "name": "agent", "type": "address" },
                    { "name": "amount", "type": "uint256" },
                    { "name": "milestonesCompleted", "type": "uint8" },
                    { "name": "status", "type": "bytes" },
                    { "name": "remainingBalance", "type": "uint256" },
                    { "name": "hasCreator", "type": "bool" }
                ],
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

// Status mapping for UI display
export const STATUS_MAPPING: { [key: string]: string } = {
    "Fabric": "Fabric",
    "FabSent": "Fabric Sent",
    "OutMade": "Outfit Made",
    "OutfRec": "Outfit Received",
    "Complete": "Complete",
    "Invalid": "Invalid"
};