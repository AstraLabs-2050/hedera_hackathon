'use client';

import countryList from "react-select-country-list";
import Modal from '../components/common/Modal';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DeliveryFormValues } from './DeliveryFormModal';
import { MeasurementFormValues } from './MeasurementFormModal';
import Image from 'next/image';

export type DeliveryMeasurementFormValues = DeliveryFormValues &
    MeasurementFormValues & {
        shippingStatus: 'Pending' | 'Sent';
    };

const PillInput = ({ label, field, unit, fullWidth = false, value, onChange }: any) => (
    <div
        className={`flex items-center justify-between rounded-full border border-[#E0E0E0] overflow-hidden 
      ${fullWidth ? 'w-full' : 'w-full md:w-[196px]'} h-[43px]`}
    >
        <span className="text-sm px-3 h-full flex items-center" style={{ backgroundColor: '#F8F8F8' }}>
            {label}
        </span>
        <div className="flex items-center gap-2 px-3 flex-1">
            <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={value}
                onChange={(e) => onChange(field, e.target.value)}
                className="text-right bg-transparent focus:outline-none text-[#4F4F4F] placeholder-[#4F4F4F] w-full h-full"
            />
            <span className="text-sm text-[#4F4F4F]">{unit}</span>
        </div>
    </div>
);

const PillDoubleInput = ({
    label,
    leftField,
    rightField,
    leftValue,
    rightValue,
    onChange,
}: any) => (
    <div className="flex items-center justify-between rounded-full border border-[#E0E0E0] overflow-hidden w-full md:w-[196px] h-[43px]">
        <span className="text-sm px-3 h-full flex items-center" style={{ backgroundColor: '#F8F8F8' }}>
            {label}
        </span>
        <div className="flex px-1 flex-1">
            <div className="w-px bg-[#E0E0E0]" />
            <input
                type="text"
                inputMode="decimal"
                placeholder="Left"
                value={leftValue}
                onChange={(e) => onChange(leftField, e.target.value)}
                className="text-center bg-transparent focus:outline-none text-[#4F4F4F] placeholder-[#4F4F4F] 
                   flex-1 md:w-[65px] h-full"
            />
            <div className="w-px bg-[#E0E0E0]" />
            <input
                type="text"
                inputMode="decimal"
                placeholder="Right"
                value={rightValue}
                onChange={(e) => onChange(rightField, e.target.value)}
                className="text-center bg-transparent focus:outline-none text-[#4F4F4F] placeholder-[#4F4F4F] 
                   flex-1 md:w-[65px] h-full"
            />
        </div>
    </div>
);

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: DeliveryMeasurementFormValues) => void;
};

export default function DeliveryMeasurementFormModal({ open, onClose, onSubmit }: Props) {

// inside component
const countries = countryList().getData();

    const [delivery, setDelivery] = useState<DeliveryFormValues>({
        country: 'United Kingdom',
        fullName: '',
        phone: '',
        address: '',
        saveForLater: true,
    });

    const [measurement, setMeasurement] = useState<MeasurementFormValues>({
        neck: '',
        chest: '',
        armLeft: '',
        armRight: '',
        waist: '',
        weight: '',
        hips: '',
        legs: '',
        thighLeft: '',
        thighRight: '',
        calfLeft: '',
        calfRight: '',
    });

    const [savedAddress, setSavedAddress] = useState<DeliveryFormValues | null>(null);

    // Fetch saved address (dummy API for now)
 useEffect(() => {
        async function fetchSavedAddress() {
            try {
                const res = await fetch('/api/user/saved-address'); // dummy endpoint
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();

                if (data && data.fullName) setSavedAddress(data);
                else setSavedAddress(null);
            } catch {
                // ❌ Ignore fetch errors for now
                setSavedAddress(null);
            }
        }
        fetchSavedAddress();
    }, []);


    const handleChange = (field: keyof MeasurementFormValues, val: string) => {
        if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
            setMeasurement((prev) => ({ ...prev, [field]: val }));
        }
    };

    const handleSubmit = () => {
        onSubmit({ ...delivery, ...measurement, shippingStatus: 'Pending' });
        onClose();
    };

    if (!open) return null;

    return (
        <Modal open={open} onClose={onClose} labelledBy="delivery-measurement-title">
            <div className="relative p-4 md:p-6 max-w-[1440px] w-full mx-auto">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-full hover:bg-[#F3F3F3]"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                <h2 id="delivery-measurement-title" className="text-2xl font-[ClashGrotesk-bold] mb-6">
                    Your Delivery & Measurement Details
                </h2>

                {/* Delivery Section */}
                <div className="border-b border-[#EDEDED] pb-6 mb-6">
                    {savedAddress && (
                        <>
                            <h3 className="text-[15px] font-[ClashGrotesk-bold] mb-3">Saved Address</h3>
                            <div className="border rounded-xl p-4 mb-6">
                                <p className="font-semibold">{savedAddress.fullName}</p>
                                <p className="text-sm text-[#4F4F4F]">{savedAddress.address}</p>
                                <div className="flex gap-4 mt-2 flex-wrap text-sm">
                                    <button
                                        onClick={() =>
                                            setDelivery((prev) => ({ ...prev, ...savedAddress }))
                                        }
                                        className="text-blue-500"
                                    >
                                        Use this Address
                                    </button>
                                    <button
                                        onClick={() => setSavedAddress(null)}
                                        className="text-red-500"
                                    >
                                        Delete Address
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <h3 className="text-[15px] font-[ClashGrotesk-bold] mb-3">Add New Address</h3>
                  <select
  className="w-full h-[48px] rounded-full border px-4 text-[14px] mb-4"
  value={delivery.country}
  onChange={(e) => setDelivery({ ...delivery, country: e.target.value })}
>
  {countries.map((c) => (
    <option key={c.value} value={c.label}>
      {c.label}
    </option>
  ))}
</select>

                    <input
                        className="w-full h-[48px] rounded-full border px-4 text-[14px] mb-4"
                        placeholder="Full Name"
                        value={delivery.fullName}
                        onChange={(e) => setDelivery({ ...delivery, fullName: e.target.value })}
                    />
                    <input
                        className="w-full h-[48px] rounded-full border px-4 text-[14px] mb-4"
                        placeholder="Phone Number"
                        value={delivery.phone}
                        onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
                    />
                    <textarea
                        className="w-full min-h-[120px] rounded-2xl border px-4 py-3 text-[14px] mb-4"
                        placeholder="Enter your full address, include postcode, apt, town..."
                        value={delivery.address}
                        onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                    />
                </div>

                {/* Measurement Section */}
                <div className="bg-[#F8F8F8] rounded-lg flex gap-2 items-center border-b border-[#EDEDED] p-4 mb-4">
                    <Image src="/i.svg" alt="Info icon" width={20} height={20} />
                    <div>
                        <h2 className="text-[#1D40C8] text-[15px] font-[ClashGrotesk-medium]">
                            Don't know your size?
                        </h2>
                        <p className="text-[15px] text-[#4F4F4F]">
                            We advise you visit a tailor close to you to get your accurate measurement to ensure
                            quality output.
                        </p>
                    </div>
                </div>

                <div className="bg-[#F8F8F8] text-black font-[ClashGrotesk-medium] 
                flex flex-col max-[500px]:flex-col md:flex-row 
                justify-between rounded-full my-4 flex-wrap">
                    <span className="flex-1 text-center py-2 text-sm font-medium border-b max-[500px]:border-b md:border-b-0">
                        Top
                    </span>
                    <span className="flex-1 text-center py-2 text-sm font-medium md:border-l">
                        Bottom
                    </span>
                </div>

                <div className="p-2">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-4 md:pr-6">
                            <PillInput label="Neck" field="neck" unit="CM" value={measurement.neck} onChange={handleChange} />
                            <PillInput label="Chest" field="chest" unit="CM" value={measurement.chest} onChange={handleChange} />
                            <PillDoubleInput
                                label="Arm"
                                leftField="armLeft"
                                rightField="armRight"
                                leftValue={measurement.armLeft}
                                rightValue={measurement.armRight}
                                onChange={handleChange}
                            />
                            <PillInput label="Waist" field="waist" unit="CM" value={measurement.waist} onChange={handleChange} />
                        </div>

                        <div className="hidden md:block w-px bg-[#E0E0E0]" />

                        <div className="flex-1 space-y-4 md:pl-6">
                            <PillInput label="Hips" field="hips" unit="CM" value={measurement.hips} onChange={handleChange} />
                            <PillInput label="Legs" field="legs" unit="CM" value={measurement.legs} onChange={handleChange} />
                            <PillDoubleInput
                                label="Thigh"
                                leftField="thighLeft"
                                rightField="thighRight"
                                leftValue={measurement.thighLeft}
                                rightValue={measurement.thighRight}
                                onChange={handleChange}
                            />
                            <PillDoubleInput
                                label="Calf"
                                leftField="calfLeft"
                                rightField="calfRight"
                                leftValue={measurement.calfLeft}
                                rightValue={measurement.calfRight}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <PillInput label="Weight" field="weight" unit="KG" fullWidth value={measurement.weight} onChange={handleChange} />
                    </div>

                    <label className="flex items-center gap-2 text-sm my-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={delivery.saveForLater}
                            onChange={(e) => setDelivery({ ...delivery, saveForLater: e.target.checked })}
                            className="peer hidden"
                        />
                        <span
                            className={`w-5 h-5 rounded border border-black flex items-center justify-center peer-checked:bg-black`}
                        >
                            {delivery.saveForLater && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-7.778 7.778a1 1 0 01-1.414 0L3.293 10.85a1 1 0 111.414-1.414l3.1 3.1 7.071-7.071a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </span>
                        <span>Save details for later</span>
                    </label>

                    <div className="flex flex-col md:flex-row justify-between mt-8 gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 md:py-4 rounded-full border border-black text-black text-[15px]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 py-3 md:py-4 rounded-full bg-black text-white text-[15px]"
                        >
                            Send this Details
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
