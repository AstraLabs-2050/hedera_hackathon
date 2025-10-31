"use client";

import { useState } from "react";
import Image from "next/image";

export type MeasurementFormValues = {
    neck: string;
    chest: string;
    armLeft: string;
    armRight: string;
    waist: string;
    weight: string;
    hips: string;
    legs: string;
    thighLeft: string;
    thighRight: string;
    calfLeft: string;
    calfRight: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: MeasurementFormValues) => void;
};

// Single input pill component (moved outside to prevent re-creation)
const PillInput = ({
    label,
    field,
    unit,
    fullWidth = false,
    value,
    onChange,
}: {
    label: string;
    field: keyof MeasurementFormValues;
    unit: string;
    fullWidth?: boolean;
    value: string;
    onChange: (field: keyof MeasurementFormValues, val: string) => void;
}) => (
    <div
        className={`flex items-center justify-between rounded-full border border-[#E0E0E0] overflow-hidden ${fullWidth ? "w-full" : "w-[182px]"
            } h-[43px]`}
    >
        {/* Label with background */}
        <span
            className="text-sm px-3 h-full flex items-center"
            style={{ backgroundColor: "#F8F8F8" }}
        >
            {label}
        </span>

        {/* Input + unit */}
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

// Double input pill component (moved outside to prevent re-creation)
const PillDoubleInput = ({
    label,
    leftField,
    rightField,
    leftValue,
    rightValue,
    onChange,
}: {
    label: string;
    leftField: keyof MeasurementFormValues;
    rightField: keyof MeasurementFormValues;
    leftValue: string;
    rightValue: string;
    onChange: (field: keyof MeasurementFormValues, val: string) => void;
}) => (
    <div className="flex items-center justify-between rounded-full border border-[#E0E0E0] overflow-hidden w-[182px] h-[43px]">
        {/* Label with background */}
        <span
            className="text-sm px-3 h-full flex items-center"
            style={{ backgroundColor: "#F8F8F8" }}
        >
            {label}
        </span>

        {/* Two inputs */}
        <div className="flex px-1">
            <div className="w-px bg-[#E0E0E0]" />
            <input
                type="text"
                inputMode="decimal"
                placeholder="Left"
                value={leftValue}
                onChange={(e) => onChange(leftField, e.target.value)}
                className="text-center bg-transparent focus:outline-none text-[#4F4F4F] placeholder-[#4F4F4F] w-[65px] h-full"
            />
            <div className="w-px bg-[#E0E0E0]" />
            <input
                type="text"
                inputMode="decimal"
                placeholder="Right"
                value={rightValue}
                onChange={(e) => onChange(rightField, e.target.value)}
                className="text-center bg-transparent focus:outline-none text-[#4F4F4F] placeholder-[#4F4F4F] w-[65px] h-full"
            />
        </div>
    </div>
);

export default function MeasurementModalForm({
    open,
    onClose,
    onSubmit,
}: Props) {
    const [values, setValues] = useState<MeasurementFormValues>({
        neck: "",
        chest: "",
        armLeft: "",
        armRight: "",
        waist: "",
        weight: "",
        hips: "",
        legs: "",
        thighLeft: "",
        thighRight: "",
        calfLeft: "",
        calfRight: "",
    });

    const handleChange = (field: keyof MeasurementFormValues, val: string) => {
        // Only allow numbers and one decimal point
        if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
            setValues((prev) => ({ ...prev, [field]: val }));
        }
    };

    const handleSubmit = () => {
        onSubmit(values);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl p-0 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="bg-black text-white flex items-center justify-center gap-2 rounded-t-lg px-4 py-6">
                    <Image
                        src="/measure.svg"
                        alt="Measurement Icon"
                        width={24}
                        height={24}
                    />
                    <span className="text-[15px] font-[ClashGrotesk-semibold]">
                        Outfit Measurement
                    </span>
                </div>

                {/* Top/Bottom tabs */}
                <div className="bg-[#F8F8F8] text-black font-[ClashGrotesk-medium] flex justify-between rounded-full mx-6 mt-4">
                    <span className="flex-1 text-center py-2 text-sm font-medium">
                        Top
                    </span>
                    <span className="flex-1 text-center py-2 text-sm font-medium border-l">
                        Bottom
                    </span>
                </div>

                {/* Form Grid with divider */}
                <div className="p-6">
                    <div className="flex">
                        {/* Top */}
                        <div className="flex-1 space-y-4 pr-6">
                            <PillInput label="Neck" field="neck" unit="CM" value={values.neck} onChange={handleChange} />
                            <PillInput label="Chest" field="chest" unit="CM" value={values.chest} onChange={handleChange} />
                            <PillDoubleInput 
                                label="Arm" 
                                leftField="armLeft" 
                                rightField="armRight" 
                                leftValue={values.armLeft}
                                rightValue={values.armRight}
                                onChange={handleChange}
                            />
                            <PillInput label="Waist" field="waist" unit="CM" value={values.waist} onChange={handleChange} />
                        </div>

                        {/* Divider */}
                        <div className="w-px bg-[#E0E0E0]" />

                        {/* Bottom */}
                        <div className="flex-1 space-y-4 pl-6">
                            <PillInput label="Hips" field="hips" unit="CM" value={values.hips} onChange={handleChange} />
                            <PillInput label="Legs" field="legs" unit="CM" value={values.legs} onChange={handleChange} />
                            <PillDoubleInput 
                                label="Thigh" 
                                leftField="thighLeft" 
                                rightField="thighRight" 
                                leftValue={values.thighLeft}
                                rightValue={values.thighRight}
                                onChange={handleChange}
                            />
                            <PillDoubleInput 
                                label="Calf" 
                                leftField="calfLeft" 
                                rightField="calfRight" 
                                leftValue={values.calfLeft}
                                rightValue={values.calfRight}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Full-width Weight field below */}
                    <div className="mt-6">
                        <PillInput label="Weight" field="weight" unit="KG" fullWidth value={values.weight} onChange={handleChange} />
                    </div>
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    className="mt-2 mb-6 mx-6 w-[calc(100%-3rem)] bg-black text-white rounded-full p-3 font-[ClashGrotesk-semibold]"
                >
                    Submit
                </button>
            </div>
        </div>
    );
}