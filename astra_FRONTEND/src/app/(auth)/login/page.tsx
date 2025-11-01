"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { LoginFormData, loginSchema } from "@/lib/validations/auth";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth(); // Fixed: was 'loading'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-8'>
        <div className='bg-white rounded-2xl border border-gray-300 p-8 shadow-sm'>
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
            <h2 className='text-xl font-semibold mt-6 mb-2'>Welcome Back</h2>
            <p className='text-gray-600'>
              Sign in to access your fashion collections
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
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                {...register("email")}
                placeholder='Enter your email address'
                className='mt-1 rounded-full h-12'
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
                  className='pr-10 rounded-full h-12'
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
            </div>

            <div className='flex items-center justify-end'>
              <div className='text-sm'>
                <Link
                  href='/'
                  className='font-medium text-black hover:underline'>
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type='submit'
              className='w-full bg-black hover:bg-gray-800 text-white py-3 rounded-full h-12'
              disabled={isLoading}>
              {isLoading ? (
                <div className='flex items-center space-x-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border border-b-0 border-white'></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className='text-center text-sm text-gray-600 mt-6'>
            Don&apos;t have an account?{" "}
            <Link
              href='/register'
              className='text-black font-medium hover:underline'>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
