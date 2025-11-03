import React, { useState } from 'react';
import { getContract, prepareContractCall, sendTransaction, readContract } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { client } from '../../client';
import { baseSepolia } from 'thirdweb/chains';
import { ESCROW_ADDRESS, ESCROW_ABI } from '../../constants/contracts';
import { EscrowDetails } from '../../types/escrow';

const EscrowManager: React.FC = () => {
    const [escrowId, setEscrowId] = useState<string>('');
    const [escrowDetails, setEscrowDetails] = useState<EscrowDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<string>('');

    const account = useActiveAccount();
    const address = account?.address;

    const contract = getContract({
        client: client,
        chain: baseSepolia,
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
    });

    // Function to convert hex to ASCII string
    const hexToAscii = (hex: string | undefined): string => {
        try {
            if (!hex) return 'Unknown';

            // Remove '0x' prefix if present
            const cleanHex = hex.replace(/^0x/, '');

            // Split the hex string into pairs
            const hexChars = cleanHex.match(/.{1,2}/g) || [];

            // Convert each hex pair to its ASCII character
            let str = '';
            for (let i = 0; i < hexChars.length; i++) {
                const charCode = parseInt(hexChars[i], 16);
                // Only add printable ASCII characters
                if (charCode >= 32 && charCode <= 126) {
                    str += String.fromCharCode(charCode);
                }
            }

            return str.trim() || 'Unknown';
        } catch (error) {
            console.error('Error converting hex to ASCII:', error);
            return 'Unknown';
        }
    };

    const fetchEscrowDetails = async () => {
        if (!escrowId) {
            setStatus('Please enter an escrow ID');
            return;
        }

        try {
            setLoading(true);
            setStatus('Fetching escrow details...');

            // Convert string ID to number for contract call
            const tokenId = parseInt(escrowId);

            const details = await readContract({
                contract,
                method: "getEscrowDetails",
                params: [BigInt(tokenId)]
            });

            console.log('Raw details from contract:', details);

            // The contract returns an object with named properties, not an array
            const formattedDetails: EscrowDetails = {
                shopper: details.shopper || '0x0000000000000000000000000000000000000000',
                maker: details.maker || '0x0000000000000000000000000000000000000000',
                creator: details.creator || '0x0000000000000000000000000000000000000000',
                treasury: details.treasury || '0x0000000000000000000000000000000000000000',
                amount: details.amount ? (Number(details.amount) / 10 ** 6).toString() : '0', // Convert BigInt to USDC units
                milestonesCompleted: details.milestonesCompleted ? Number(details.milestonesCompleted) : 0,
                status: hexToAscii(details.status), // Convert hex to ASCII string
                remainingBalance: details.remainingBalance ? (Number(details.remainingBalance) / 10 ** 6).toString() : '0', // Convert BigInt to USDC units
                hasCreator: Boolean(details.hasCreator)
            };

            setEscrowDetails(formattedDetails);
            setStatus('Escrow details fetched successfully!');
        } catch (error) {
            console.error("Error fetching escrow details:", error);
            setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setEscrowDetails(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteMilestone = async () => {
        if (!escrowId || !account) return;

        try {
            setLoading(true);
            setStatus('Completing milestone...');

            const tokenId = parseInt(escrowId);

            // Prepare transaction
            const transaction = prepareContractCall({
                contract,
                method: "completeMilestoneByAgent",
                params: [BigInt(tokenId)]
            });

            // Send transaction
            await sendTransaction({
                transaction,
                account
            });

            setStatus('Milestone completed successfully!');

            // Refresh escrow details
            fetchEscrowDetails();
        } catch (error) {
            console.error("Error completing milestone:", error);
            setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const isAgent = (): boolean => {
        if (!escrowDetails || !address) return false;
        return escrowDetails.shopper.toLowerCase() === address.toLowerCase();
    };

    return (
        <div className="escrow-manager">
            <h2>Manage Escrow</h2>

            <div className="escrow-id-input">
                <input
                    type="text"
                    value={escrowId}
                    onChange={(e) => setEscrowId(e.target.value)}
                    placeholder="Enter escrow ID"
                />
                <button
                    onClick={fetchEscrowDetails}
                    disabled={loading || !escrowId}
                >
                    {loading ? 'Loading...' : 'Fetch Details'}
                </button>
            </div>

            {status && <div className={`status-message ${status.includes('Error') ? 'error' : 'success'}`}>{status}</div>}

            {escrowDetails && (
                <div className="escrow-details">
                    <h3>Escrow #{escrowId} Details</h3>

                    <div className="details-grid">
                        <div className="detail-item">
                            <label>Shopper (Agent)</label>
                            <p className="address">{escrowDetails.shopper}</p>
                        </div>

                        <div className="detail-item">
                            <label>Maker</label>
                            <p className="address">{escrowDetails.maker}</p>
                        </div>

                        {escrowDetails.hasCreator && (
                            <div className="detail-item">
                                <label>Creator</label>
                                <p className="address">{escrowDetails.creator}</p>
                            </div>
                        )}

                        <div className="detail-item">
                            <label>Treasury</label>
                            <p className="address">{escrowDetails.treasury}</p>
                        </div>

                        <div className="detail-item">
                            <label>Total Amount</label>
                            <p>{escrowDetails.amount} USDC</p>
                        </div>

                        <div className="detail-item">
                            <label>Remaining Balance</label>
                            <p>{escrowDetails.remainingBalance} USDC</p>
                        </div>

                        <div className="detail-item">
                            <label>Milestones Completed</label>
                            <p>{escrowDetails.milestonesCompleted} / 4</p>
                        </div>

                        <div className="detail-item">
                            <label>Status</label>
                            <p>{escrowDetails.status}</p>
                        </div>
                    </div>

                    { escrowDetails.milestonesCompleted < 4 && (
                        <button
                            className="complete-milestone-button"
                            onClick={handleCompleteMilestone}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Complete Next Milestone'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default EscrowManager;