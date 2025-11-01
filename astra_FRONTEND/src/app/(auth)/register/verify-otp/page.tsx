"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { OTPFormData, otpSchema } from "@/lib/validations/auth";
// import { useRouter } from "next/navigation";
import Image from "next/image";

export default function VerifyOTPPage() {
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { verifyOTP, isLoading, error, pendingEmail, clearError } = useAuth();
  // const router = useRouter();

  const {
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const otpValue = watch("otp");

  // Redirect if no pending email
  // useEffect(() => {
  //   if (!pendingEmail) {
  //     router.replace("/register");
  //   }
  // }, [pendingEmail, isLoading, router]);

  // Timer for resend functionality
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Clear errors when OTP changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [otpValue, error, clearError]);

  const onSubmit = async (data: OTPFormData) => {
    try {
      await verifyOTP(data.otp);
    } catch (err) {
      console.error("OTP verification error:", err);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !pendingEmail) return;

    try {
      // Implement resend OTP API call here when available
      // await api.resendOTP({ email: pendingEmail });
      setResendTimer(60);
      setCanResend(false);
      console.log("Resend OTP for:", pendingEmail);
    } catch (err) {
      console.error("Failed to resend OTP:", err);
    }
  };

  // Show loading state during initial check
  if (isLoading && !pendingEmail) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <div className='w-full max-w-md space-y-8'>
          <div className='bg-white rounded-2xl border border-gray-400 p-8 shadow-sm text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4'></div>
            <h2 className='text-xl font-semibold mb-2'>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-8'>
        <div className='bg-white rounded-2xl border border-gray-400 p-8 shadow-sm'>
          <div className='text-center mb-8'>
            <div className='w-32 mx-auto'>
              <Image
                src='/astraLogo.svg'
                alt='Astra brand logo'
                className='w-full h-auto'
                width={120}
                height={30}
                priority
              />
            </div>

            <h2 className='text-xl font-semibold mt-6 mb-2'>
              Verify Your Email
            </h2>
            <p className='text-gray-600'>
              Enter the 4-digit code sent to your email
            </p>
            {pendingEmail && (
              <p className='text-sm text-gray-500 mt-1 truncate'>
                {pendingEmail}
              </p>
            )}
          </div>

          {error && (
            <div className='mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='flex justify-center'>
              <InputOTP
                maxLength={4}
                value={otpValue}
                onChange={(value) => setValue("otp", value)}
                className='gap-2'
                disabled={isLoading}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className='w-12 h-12 text-lg' />
                  <InputOTPSlot index={1} className='w-12 h-12 text-lg' />
                  <InputOTPSlot index={2} className='w-12 h-12 text-lg' />
                  <InputOTPSlot index={3} className='w-12 h-12 text-lg' />
                  <InputOTPSlot index={4} className='w-12 h-12 text-lg' />
                  <InputOTPSlot index={5} className='w-12 h-12 text-lg' />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {errors.otp && (
              <p className='text-red-500 text-sm text-center'>
                {errors.otp.message}
              </p>
            )}

            <Button
              type='submit'
              className='w-full bg-black hover:bg-gray-800 h-10 text-white py-3 rounded-full'
              disabled={isLoading || otpValue.length !== 4}>
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>

          <div className='text-center mt-6'>
            <p className='text-sm text-gray-600'>
              Didn&apos;t receive the code?{" "}
              {canResend ? (
                <button
                  onClick={handleResendOTP}
                  className='text-black font-medium hover:underline'
                  disabled={isLoading}>
                  Resend Code
                </button>
              ) : (
                <span className='text-gray-400'>Resend in {resendTimer}s</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
