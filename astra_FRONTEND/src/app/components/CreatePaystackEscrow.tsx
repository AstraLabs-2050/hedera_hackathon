'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

type Props = {
    trigger: React.ReactNode;
    chatId: string;
    token: string;
    userEmail?: string;
    onCreateEscrow?: (data: any) => void;
};

export default function CreatePaystackEscrow({
    trigger,
    chatId,
    token,
    userEmail,
    onCreateEscrow,
}: Props) {
    const [form, setForm] = useState({
        amount: '',
        bankName: '',
        accountNumber: '',
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState(userEmail || '');

    // 🧠 Decode email from token if not passed explicitly
    useEffect(() => {
        if (!userEmail && token) {
            try {
                const decoded: any = jwtDecode(token);
                const decodedEmail =
                    decoded?.email || decoded?.user?.email || decoded?.data?.email || '';
                setEmail(decodedEmail || 'testbuyer@example.com');
            } catch {
                setEmail('testbuyer@example.com');
            }
        }
    }, [token, userEmail]);

    // Load Paystack script once
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // 💰 Handle Paystack escrow creation
    const handleCreateEscrow = async () => {
        if (!form.amount || !form.bankName || !form.accountNumber) {
            setStatus('Please fill all fields.');
            return;
        }

        try {
            setLoading(true);
            setStatus('Initializing payment...');

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const finalEmail = email || 'testbuyer@example.com';

            // Step 1 — Initialize Paystack payment
            const initRes = await fetch('/api/paystack/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: finalEmail,
                    amount: Number(form.amount),
                    currency: 'NGN',
                }),
            });

            const initData = await initRes.json();
            if (!initRes.ok) throw new Error(initData.error || 'Paystack init failed');

            const { reference, authorization_url } = initData?.data || {};
            if (!reference || !authorization_url)
                throw new Error('Invalid Paystack response.');

            console.log('✅ Paystack initialized:', reference);

            // Step 2 — Create escrow in backend
            const escrowRes = await fetch(
                `${baseUrl}/marketplace/chat/${chatId}/escrow/create`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        amount: Number(form.amount),
                        reference,
                    }),
                }
            );

            const escrowData = await escrowRes.json();
            if (!escrowRes.ok)
                throw new Error(escrowData.message || 'Backend escrow creation failed');

            console.log('📦 Escrow stored in backend:', escrowData);

            // Step 3 — Notify parent & persist locally
            const newEscrow = {
                amount: Number(form.amount),
                remainingBalance: Number(form.amount),
                reference,
                status: 'pending',
            };

            // Notify parent (for immediate UI update)
            onCreateEscrow?.(newEscrow);

            // 🪣 Store in localStorage (for persistence after redirect)
            localStorage.setItem(`escrow_${chatId}`, JSON.stringify(newEscrow));

            // Step 4 — Show success modal then redirect
            setShowSuccessModal(true);
            setOpen(false);

            setTimeout(() => {
                window.location.href = authorization_url;
            }, 1500);
        } catch (err: any) {
            console.error('❌ Escrow creation failed:', err);
            setStatus(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="max-w-2xl bg-white border-0 p-0 rounded-3xl overflow-hidden">
                    <DialogHeader className="bg-white p-6 pb-8 border-b border-b-gray-200">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <div className="flex gap-2 items-center">
                                    <Image src="/bank-fill.svg" alt="escrow" width={24} height={24} />
                                    <DialogTitle className="text-2xl font-bold text-black">
                                        Create Escrow (Paystack)
                                    </DialogTitle>
                                </div>
                                <p className="text-black text-sm mt-1">
                                    Securely create a new escrow transaction
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Amount (₦)</Label>
                            <Input
                                type="number"
                                name="amount"
                                value={form.amount}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="bg-white border-gray-200 focus:border-black rounded-full h-11 text-sm pr-16"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Bank Name</Label>
                            <Input
                                name="bankName"
                                value={form.bankName}
                                onChange={handleInputChange}
                                placeholder="e.g., GTBank"
                                className="bg-white border-gray-200 focus:border-black rounded-full h-11 text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Account Number</Label>
                            <Input
                                name="accountNumber"
                                value={form.accountNumber}
                                onChange={handleInputChange}
                                placeholder="0123456789"
                                className="bg-white border-gray-200 focus:border-black rounded-full h-11 text-sm"
                            />
                        </div>

                        <Button
                            onClick={handleCreateEscrow}
                            disabled={loading || !form.amount}
                            className="w-full bg-black text-white rounded-full h-12 text-base font-medium shadow-lg"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Create Escrow & Pay'
                            )}
                        </Button>

                        {status && <p className="text-sm text-gray-500 text-center">{status}</p>}
                    </div>
                </DialogContent>
            </Dialog>

            {/* ✅ Success modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="max-w-sm bg-white text-center rounded-2xl py-10">
                    <CheckCircle2 className="text-green-500 h-14 w-14 mx-auto mb-4" />
                    <DialogTitle className="text-2xl font-semibold text-gray-800">
                        Escrow Created!
                    </DialogTitle>
                    <p className="text-gray-500 mt-2">Redirecting to Paystack checkout...</p>
                </DialogContent>
            </Dialog>
        </>
    );
}
