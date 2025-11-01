import React, { useState, useEffect } from 'react';
import { getContract, readContract } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { client } from '../../client';
import { baseSepolia } from 'thirdweb/chains';
import { ESCROW_ADDRESS, ESCROW_ABI } from '../../constants/contracts';

const MyEscrows: React.FC = () => {
    const [depositBalance, setDepositBalance] = useState<string>('0');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const account = useActiveAccount();
    const address = account?.address;

    const contract = getContract({
        client: client,
        chain: baseSepolia,
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
    });

    useEffect(() => {
        if (address) {
            fetchDepositBalance();
        }
    }, [address]);

    const fetchDepositBalance = async () => {
        if (!address) return;

        try {
            setLoading(true);
            setError(null);

            // Get deposit balance for this user as both shopper and agent
            const balance = await readContract({
                contract,
                method: "getDepositBalance",
                params: [address, address]
            });

            // Convert balance to USDC units
            const formattedBalance = (Number(balance) / 10 ** 6).toString();
            setDepositBalance(formattedBalance);
        } catch (err) {
            console.error("Error fetching deposit balance:", err);
            setError('Failed to fetch deposit balance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="my-escrows">
            <h2>My Escrow Balance</h2>

            {loading && <p className="loading">Loading deposit balance...</p>}

            {error && <p className="error">{error}</p>}

            {!loading && !error && (
                <div className="escrow-card">
                    <h3>Deposit Balance</h3>
                    <p>{depositBalance} USDC</p>
                    <p className="note">
                        This is your available balance in the escrow system. You can use these funds to create new escrows.
                    </p>

                    <button
                        className="refresh-button"
                        onClick={fetchDepositBalance}
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh Balance'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyEscrows;