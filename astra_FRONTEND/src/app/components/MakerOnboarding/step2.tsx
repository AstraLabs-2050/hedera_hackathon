'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Button from '../button';
import { verifyMakerOtp, resendOtp } from '../../../utils/makerApi';
import toast from 'react-hot-toast';


type Step2Props = {
  formData: {
    email: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  onBack: () => void;
};

export default function Step2({ formData, onNext }: Step2Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmitOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 4) return toast('Please enter all 4 digits');

    setIsLoading(true);

    try {
      const res = await verifyMakerOtp({
        email: formData.email,
        otp: fullOtp,
      });

      console.log('✅ OTP Verified:', res);
      onNext();
    } catch (err: any) {
      toast(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email) return alert("No email found");

    setIsLoading(true);

    try {
        const response = await resendOtp(formData.email);
        toast.success("OTP resent successfully. Please check your inbox/spam.");
    } catch (err: any) {
        toast(err.message);
    } finally {
        setIsLoading(false);
    }
};


  return (
    <div className="h-[100dvh] w-full flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-[480px] flex flex-col items-center justify-center">
        <Image className="mb-4" src="/logo.png" alt="logo" width={155} height={37} />

        <h2 className="font-[ClashGrotesk-Medium] font-[500] text-2xl md:text-3xl mb-2 text-center">
          OTP Verification
        </h2>

        <div className="my-2 text-center px-2">
          <p className="text-base md:text-lg text-black">
            We have sent a verification code to email address
          </p>
          <span className="flex flex-wrap justify-center items-center gap-1 text-center">
            <p className="text-black font-[500] font-[ClashGrotesk-Medium] text-base md:text-lg">
              {formData.email || 'name@example.com'}.
            </p>
            <a
              href="#"
              className="underline text-black font-[500] font-[ClashGrotesk-Medium] text-base md:text-lg"
            >
              Wrong Email?
            </a>
          </span>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center gap-3 md:gap-4 my-6 w-full">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                if (el) inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 md:w-20 md:h-14 text-center text-xl border border-[#BDBDBD] rounded-lg focus:outline-none focus:border-black"
            />
          ))}
        </div>

        <Button
          label={isLoading ? 'Loading...' : 'Submit'}
          fullWidth
          disabled={isLoading}
          onClick={handleSubmitOtp}
          // onClick={onNext}
          className="rounded-xl w-full max-w-[360px]"
        />
      </div>
      <p className="text-sm mt-2 text-center">
        Didn’t receive the code?{' '}
        <button
          onClick={handleResendOtp}
          className="text-black underline font-medium"
          disabled={isLoading}
        >
          Resend OTP
        </button>
      </p>
    </div>
  );
}
