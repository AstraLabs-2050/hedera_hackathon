import React, { useState } from 'react';
import { getContract, prepareContractCall, sendTransaction, readContract } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { client } from '../../client';
import { baseSepolia } from 'thirdweb/chains';
import { ESCROW_ADDRESS, ESCROW_ABI, USDC_ADDRESS, ERC20_ABI } from '../../constants/contracts';
import { CreateEscrowForm } from '../../types/escrow';

const EscrowCreator: React.FC = () => {
    const [form, setForm] = useState<CreateEscrowForm>({
        makerAddress: '',
        treasuryAddress: '',
        creatorAddress: '',
        amount: '',
    });
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const account = useActiveAccount();
    const address = account?.address;

    const escrowContract = getContract({
        client: client,
        chain: baseSepolia,
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
    });

    const usdcContract = getContract({
        client: client,
        chain: baseSepolia,
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleApproveUsdc = async () => {
        if (!form.amount || !account) {
            setStatus('Please enter an amount first');
            return;
        }

        try {
            setLoading(true);
            setStatus('Approving USDC...');

            // Convert amount to units (6 decimals for USDC)
            const amountInUnits = BigInt(parseFloat(form.amount) * 10 ** 6);

            // Prepare approval transaction
            const transaction = prepareContractCall({
                contract: usdcContract,
                method: "approve",
                params: [ESCROW_ADDRESS, amountInUnits]
            });

            // Send transaction
            await sendTransaction({
                transaction,
                account
            });

            setStatus('USDC approved! You can now deposit funds to escrow.');
        } catch (error) {
            console.error("Error approving USDC:", error);
            setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDepositFunds = async () => {
        if (!form.amount || !account || !address) {
            setStatus('Please enter an amount');
            return;
        }

        try {
            setLoading(true);
            setStatus('Depositing funds...');

            const amountInUnits = BigInt(parseFloat(form.amount) * 10 ** 6);

            // Deposit funds to escrow with the creator as the agent
            const transaction = prepareContractCall({
                contract: escrowContract,
                method: "depositFunds",
                params: [amountInUnits, address]
            });

            await sendTransaction({
                transaction,
                account
            });

            setStatus('Funds deposited! Now you can create an escrow.');
        } catch (error) {
            console.error("Error depositing funds:", error);
            setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEscrow = async () => {
        if (!form.makerAddress || !form.treasuryAddress || !form.amount || !account || !address) {
            setStatus('Please fill all required fields');
            return;
        }

        try {
            setLoading(true);
            setStatus('Creating escrow...');

            const amountInUnits = BigInt(parseFloat(form.amount) * 10 ** 6);

            // Create escrow by agent (yourself)
            const transaction = prepareContractCall({
                contract: escrowContract,
                method: "createEscrowByAgent",
                params: [
                    address, // shopper (yourself)
                    form.makerAddress,
                    form.treasuryAddress,
                    form.creatorAddress || '0x0000000000000000000000000000000000000000', // Zero address if no creator
                    amountInUnits
                ]
            });

            // Send transaction
            await sendTransaction({
                transaction,
                account
            });

            setStatus('Escrow created successfully!');

            // Reset form
            setForm({
                makerAddress: '',
                treasuryAddress: '',
                creatorAddress: '',
                amount: '',
            });

        } catch (error) {
            console.error("Error creating escrow:", error);
            setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="escrow-creator">
            <h2>Create New Escrow</h2>

            {status && <div className={`status-message ${status.includes('Error') ? 'error' : 'success'}`}>{status}</div>}

            <div className="form-group">
                <label>Maker Address *</label>
                <input
                    type="text"
                    name="makerAddress"
                    value={form.makerAddress}
                    onChange={handleInputChange}
                    placeholder="0x..."
                />
            </div>

            <div className="form-group">
                <label>Treasury Address *</label>
                <input
                    type="text"
                    name="treasuryAddress"
                    value={form.treasuryAddress}
                    onChange={handleInputChange}
                    placeholder="0x..."
                />
            </div>

            <div className="form-group">
                <label>Creator Address (Optional)</label>
                <input
                    type="text"
                    name="creatorAddress"
                    value={form.creatorAddress}
                    onChange={handleInputChange}
                    placeholder="0x..."
                />
            </div>

            <div className="form-group">
                <label>Amount (USDC) *</label>
                <input
                    type="text"
                    name="amount"
                    value={form.amount}
                    onChange={handleInputChange}
                    placeholder="0.0"
                />
            </div>

            <div className="button-group">
                <button
                    onClick={handleApproveUsdc}
                    disabled={loading || !form.amount}
                    className="approve-button"
                >
                    {loading ? 'Processing...' : '1. Approve USDC'}
                </button>

                <button
                    onClick={handleDepositFunds}
                    disabled={loading || !form.amount}
                    className="approve-button"
                >
                    {loading ? 'Processing...' : '2. Deposit Funds'}
                </button>

                <button
                    onClick={handleCreateEscrow}
                    disabled={loading || !form.makerAddress || !form.treasuryAddress || !form.amount}
                    className="create-button"
                >
                    {loading ? 'Processing...' : '3. Create Escrow'}
                </button>
            </div>

            <div className="note">
                <p><strong>Note:</strong> You must first approve USDC spending, then deposit funds, and finally create an escrow.</p>
            </div>
        </div>
    );
};

export default EscrowCreator;