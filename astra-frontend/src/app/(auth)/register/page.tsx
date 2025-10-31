"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterFormData, registerSchema } from "@/lib/validations/auth";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading, error } = useAuth(); // Fixed: was 'loading'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
    } catch (err) {
      console.log(err);
    }
  };

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
                sizes='(max-width: 768px) 100vw, 280px'
              />
            </div>
            <h2 className='text-xl font-semibold mt-6 mb-1'>
              Create an Account
            </h2>
            <p className='text-gray-600'>
              Create an account to launch your fashion collections
            </p>
          </div>

          {/* Social Auth Buttons */}
          <div className='flex justify-center space-x-4 mb-5'>
            <button className='p-2 border border-gray-200 rounded-full hover:bg-gray-50'>
              <div className='w-5 h-5 flex items-center justify-center'>
                <FcGoogle size={25} />
              </div>
            </button>
            <button className='p-2 border border-gray-200 rounded-full hover:bg-gray-50'>
              <div className='w-5 h-5 rounded-full flex items-center justify-center '>
                <FaXTwitter size={25} />
              </div>
            </button>
            <button className='p-2 border border-gray-200 rounded-full hover:bg-gray-50'>
              <div className='w-5 h-5 rounded-full flex items-center justify-center'>
                <FaDiscord size={25} color='#5d69f1' />
              </div>
            </button>
          </div>

          <div className='flex items-center justify-center text-gray-400 gap-4 mb-6 text-sm'>
            <div className='border border-gray-200 flex-1'></div>
            <span>Or Continue With</span>{" "}
            <div className='border border-gray-200 flex-1'></div>
          </div>

          {error && (
            <div className='mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <Label htmlFor='fullName'>Full Name</Label>
              <Input
                id='fullName'
                {...register("fullName")}
                placeholder='Enter your full name'
                className='mt-1 rounded-full h-10'
              />
              {errors.fullName && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                {...register("email")}
                placeholder='Enter your email address'
                className='mt-1 rounded-full h-10'
              />
              {errors.email && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor='password'>Password</Label>
              <div className='relative mt-1'>
                <Input
                  id='password'
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder='Enter your password'
                  className='pr-10 rounded-full h-10'
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.password.message}
                </p>
              )}
              <p className='text-xs text-gray-500 mt-1'>
                Password must have at least 8 characters, 1 uppercase letter and
                1 number.
              </p>
            </div>

            <Button
              type='submit'
              className='w-full bg-black hover:bg-gray-800 h-10 text-white py-3 rounded-full'
              disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className='text-center text-xs text-gray-500 mt-6'>
            You acknowledge that you read, and agree to our{" "}
            <Link href='/terms' className='underline hover:text-gray-700'>
              Terms of Service
            </Link>{" "}
            and our{" "}
            <Link href='/privacy' className='underline hover:text-gray-700'>
              Privacy Policy
            </Link>
          </p>

          <p className='text-center text-sm text-gray-600 mt-4'>
            Already have an account?{" "}
            <Link
              href='/login'
              className='text-black font-medium hover:underline'>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
