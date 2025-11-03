import React, { useState } from 'react';
import { getContract, prepareContractCall, sendTransaction, readContract } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { client } from '../../client';
import { baseSepolia } from 'thirdweb/chains';
import { USDC_ADDRESS, ERC20_ABI } from '../../constants/contracts';

interface TokenBalanceProps {
    address: string;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({ address }) => {
    const [balance, setBalance] = useState<string>('0');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const account = useActiveAccount();

    const contract = getContract({
        client: client,
        chain: baseSepolia,
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
    });

    // Fetch balance when component mounts or address changes
    React.useEffect(() => {
        const fetchBalance = async () => {
            try {
                setError(null);

                const balanceData = await readContract({
                    contract,
                    method: "balanceOf",
                    params: [address]
                });

                const decimals = await readContract({
                    contract,
                    method: "decimals",
                    params: []
                });

                // Format balance using decimals
                const formattedBalance = Number(balanceData) / Math.pow(10, Number(decimals));
                setBalance(formattedBalance.toString());
            } catch (err) {
                console.error("Error fetching balance:", err);
                setError("Failed to fetch balance");
            }
        };

        fetchBalance();
    }, [address]);

    const mintTestUSDC = async () => {
        if (!account || !contract) return;

        try {
            setLoading(true);
            setError(null);

            // Prepare the transaction
            const amount = BigInt(100 * 10 ** 6); // 100 USDC with 6 decimals
            const transaction = prepareContractCall({
                contract,
                method: "mint",
                params: [address, amount]
            });

            // Send transaction
            const result = await sendTransaction({
                transaction,
                account
            });

            // Update balance
            setBalance(prev => (parseFloat(prev) + 100).toString());
        } catch (err) {
            console.error("Error minting TestUSDC:", err);
            setError(err instanceof Error ? err.message : "Failed to mint tokens");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="">
            <div className="flex flex-col items-center">
                <h3 className='text-black'>Balance</h3>
                <p className="balance-amount">
                    <span className='text-xl'>{balance}</span> USDC</p>
            </div>

            {/* <button
                className="mint-button"
                onClick={mintTestUSDC}
                disabled={loading}
            >
                {loading ? 'Minting...' : 'Mint Test USDC (100)'}
            </button> */}

            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default TokenBalance;