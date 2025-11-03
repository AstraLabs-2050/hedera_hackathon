'use client';

import Modal from '../components/common/Modal';
import { useState } from 'react';
import { X } from 'lucide-react';

export type DeliveryFormValues = {
    country: string;
    fullName: string;
    phone: string;
    address: string;
    saveForLater: boolean;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: DeliveryFormValues) => void;
};

const saved = {
    name: 'Paulina Benson',
    addressLine: '34, George Avenue, Brampton, ON L6T 8H6',
};

export default function DeliveryFormModal({ open, onClose, onSubmit }: Props) {
    const [values, setValues] = useState<DeliveryFormValues>({
        country: 'United Kingdom',
        fullName: '',
        phone: '',
        address: '',
        saveForLater: true,
    });

    const handle = (k: keyof DeliveryFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValues((v) => ({ ...v, [k]: e.target.value }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!values.fullName || !values.phone || !values.address) return;
        onSubmit(values);
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} labelledBy="delivery-title">
            <div className="relative p-6">
                <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full hover:bg-[#F3F3F3]" aria-label="Close">
                    <X size={18} />
                </button>

                <h2 id="delivery-title" className="text-2xl font-[ClashGrotesk-bold] mb-6">Your Delivery Details</h2>

                {/* Saved address */}
                <div className="border-t border-[#EDEDED] pt-4">
                    <h3 className="text-[15px] font-[ClashGrotesk-bold] mb-3">Saved Address</h3>
                    <div className="border border-[#EDEDED] rounded-xl p-4">
                        <p className="text-[15px] font-[ClashGrotesk-bold]">{saved.name}</p>
                        <p className="text-[14px] text-[#616161]">{saved.addressLine}</p>
                        <div className="flex gap-4 mt-2 text-[#3F37C9] text-[14px]">
                            <button
                                type="button"
                                onClick={() =>
                                    setValues((v) => ({ ...v, fullName: saved.name, address: saved.addressLine }))
                                }
                                className="hover:underline"
                            >
                                Use this Address
                            </button>
                            <button type="button" className="text-[#FF3B59] hover:underline">Delete Address</button>
                        </div>
                    </div>
                </div>

                {/* New address */}
                <form onSubmit={submit} className="mt-6">
                    <h3 className="text-[15px] font-[ClashGrotesk-bold] mb-3">Add New Address</h3>

                    <label className="block text-[13px] text-[#616161] mb-1">Country/Region</label>
                    <div className="relative mb-4">
                        <input
                            value={values.country}
                            onChange={handle('country')}
                            className="w-full h-[48px] rounded-full bg-[#F7F7F7] px-4 text-[14px] border border-transparent focus:border-[#D9D9D9] outline-none"
                            placeholder="Country"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2">▾</span>
                    </div>

                    <label className="block text-[13px] text-[#616161] mb-1">Full Name*</label>
                    <input
                        value={values.fullName}
                        onChange={handle('fullName')}
                        className="w-full h-[48px] rounded-full border px-4 text-[14px] mb-4"
                        placeholder="Enter your full name"
                        required
                    />

                    <label className="block text-[13px] text-[#616161] mb-1">Phone Number*</label>
                    <input
                        value={values.phone}
                        onChange={handle('phone')}
                        className="w-full h-[48px] rounded-full border px-4 text-[14px] mb-4"
                        placeholder="Your 10 digit phone number"
                        required
                    />

                    <label className="block text-[13px] text-[#616161] mb-1">Enter your full address</label>
                    <textarea
                        value={values.address}
                        onChange={handle('address')}
                        className="w-full min-h-[120px] rounded-2xl border px-4 py-3 text-[14px]"
                        placeholder="Enter your full address, include your postcode, building/apt. name, town, county..."
                        required
                    />

                    <label className="flex items-center gap-2 mt-4 text-[14px]">
                        <input
                            type="checkbox"
                            checked={values.saveForLater}
                            onChange={(e) => setValues((v) => ({ ...v, saveForLater: e.target.checked }))}
                            className="accent-black"
                        />
                        Save this address for later
                    </label>

                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-[52px] rounded-full border text-[15px]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 h-[52px] rounded-full bg-black text-white text-[15px]"
                        >
                            Send this Address
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
