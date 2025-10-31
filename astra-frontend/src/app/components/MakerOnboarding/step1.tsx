'use client';

import { useState, ChangeEvent } from 'react';
import Input from '../input';
import Button from '../button';
import Image from 'next/image';
import { registerMaker } from "../../../utils/makerApi";
import toast from 'react-hot-toast';

type Step1Props = {
  formData: {
    fullName: string;
    email: string;
    password?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
};

export default function Step1({ formData, setFormData, onNext }: Step1Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFormValid = formData.fullName && formData.email && formData.password;

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await registerMaker({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      if (res?.token) {
        localStorage.setItem("auth_token", res.token);
      }
      if (res?.user?._id) {
        localStorage.setItem("user_id", res.user._id);
      }

      toast.success("Registration successful!");
      onNext();
    } catch (err: any) {
      if (err?.message?.includes("already exists")) {
        toast("Welcome back! Resuming your onboarding.");
        onNext();
        return;
      }
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };


  return (
    <div className="flex bg-white flex-col lg:flex-row h-[100dvh]">
      <div className="flex items-center w-full lg:w-[53vw] justify-center px-4 lg:px-0 min-h-screen lg:min-h-0">
        <div className="flex flex-col w-full max-w-[440px] lg:w-[440px] items-center justify-center">
          <div className="flex flex-col justify-center items-center pb-6 lg:pb-8 border-b border-[#E0E0E0] mb-6 lg:mb-8 w-full">
            <h2 className="font-[ClashGrotesk-Medium] font-[500] text-2xl lg:text-3xl text-center lg:text-left">
              Sign Up to Astra as a Talent
            </h2>
            <p className="text-[#535353] text-base lg:text-lg pt-2 pb-4 text-center lg:text-left">
              Create an account to discover the latest fashion jobs
            </p>

            {/* Google signup button */}
            <button
              type="button"
              onClick={() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    // Redirects user to backend Google OAuth signup
    window.location.href = `${base}/auth/signup/google`;
  }}
              className="flex justify-center items-center gap-4 font-black font-[ClashGrotesk-Medium] w-full max-w-[436px] lg:w-[436px] h-12 lg:h-14 rounded-xl py-4 px-6 border border-black"
            >
              <Image
                src="/Google logo.svg"
                alt="google-logo"
                height={20}
                width={20}
              />
              <span className="text-base lg:text-[17px]">Continue with Google</span>
            </button>
          </div>

          <form
            className="w-full"
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          >
            <div className="flex flex-col gap-3 mb-3 w-full">
              <Input
                placeholder="Full Name"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="rounded-xl !w-full lg:!w-[436px]"
              />

              <Input
                placeholder="Enter your email address"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="rounded-xl !w-full lg:!w-[436px]"
              />

              <Input
                placeholder="Enter your password"
                name="password"
                type="password"
                showPasswordToggle
                required
                value={formData.password || ''}
                onChange={handleChange}
                className="rounded-xl !w-full lg:!w-[436px]"
              />

              <p className="text-xs text-[#828282]">
                Password must have at least 8 characters, a special character, 1 uppercase letter and 1 number.
              </p>
            </div>

            <div className="flex justify-center mt-4">
              <Button
                label={isLoading ? 'Loading...' : 'Create Account'}
                fullWidth={false}
                disabled={isLoading || !isFormValid}
                className="rounded-xl !w-full lg:!w-[436px]"
                onClick={handleSubmit}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}

            <div className="mt-4 text-center">
              <p className="text-sm lg:text-base text-[#828282]">
                You acknowledge that you read, and agree to our{' '}
                <a href="#" className="underline">Terms of Service</a> and{' '}
                <a href="#" className="underline">Privacy Policy</a>.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right-side illustration */}
      <div className="hidden lg:block relative overflow-hidden">
  <Image
    src="/register-img.jpg"
    alt="Talent signup"
    width={300}
    height={300}
    className="w-[47vw] h-[100vh] object-cover"
  />
  <Image
    src="/astras-logo.png"
    alt="Astra logo"
    width={349}
    height={83.5}
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  />
</div>
    </div>
  );
}
