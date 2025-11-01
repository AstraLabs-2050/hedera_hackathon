"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { useAuth } from "@/contexts/AuthContext";
import {
  BrandProfileFormData,
  brandProfileSchema,
} from "@/lib/validations/auth";
import Image from "next/image";
import { AlertCircle } from "lucide-react";

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Nigeria",
  "South Africa",
  "Ghana",
  "Kenya",
  "Brazil",
  "Mexico",
  "Argentina",
  "India",
  "Japan",
  "South Korea",
  "Singapore",
];

export default function BrandProfilePage() {
  const { createBrandProfile, isLoading, error, clearError, user } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
  } = useForm<BrandProfileFormData>({
    resolver: zodResolver(brandProfileSchema),
    mode: "onChange",
  });

  // Redirect if user already has completed profile
  useEffect(() => {
    if (user && user.profileCompleted) {
      window.location.href = "/register/wallet";
    }
  }, [user]);

  // Clear errors when form data changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [watch(), error, clearError]);

  const onSubmit = async (data: BrandProfileFormData) => {
    try {
      await createBrandProfile(data);
      // console.log("Brand Output", JSON.stringify(brandDetails));
    } catch (err) {
      // console.error("Brand profile creation error:", err);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-8'>
        <div className='bg-white rounded-2xl border border-gray-200 p-8 shadow-lg'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='w-32 mx-auto mb-6'>
              <Image
                src='/astraLogo.svg'
                alt='Astra brand logo'
                className='w-full h-auto'
                width={120}
                height={30}
                priority
              />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Create Your Brand
            </h2>
            <p className='text-gray-600'>
              Tell us about your fashion brand to complete your profile
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3'>
              <AlertCircle className='h-5 w-5 text-red-600 mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-red-800 text-sm font-medium'>
                  Profile Creation Failed
                </p>
                <p className='text-red-600 text-sm mt-1'>{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Brand Name */}
            <div>
              <Label
                htmlFor='brandName'
                className='text-sm font-semibold text-gray-700'>
                Brand Name *
              </Label>
              <Input
                id='brandName'
                {...register("brandName")}
                placeholder='Enter your brand name'
                className={`mt-1 h-12 rounded-full transition-colors ${
                  errors.brandName
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-black focus:ring-black"
                }`}
                disabled={isLoading}
              />
              {errors.brandName && (
                <p className='text-red-500 text-sm mt-1 flex items-center'>
                  <AlertCircle className='h-4 w-4 mr-1' />
                  {errors.brandName.message}
                </p>
              )}
            </div>

            {/* Brand Origin */}
            <div>
              <Label className='text-sm font-semibold text-gray-700'>
                Brand Origin *
              </Label>
              <Controller
                name='brandOrigin'
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}>
                    <SelectTrigger
                      className={`mt-1 h-12 rounded-full transition-colors ${
                        errors.brandOrigin
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-300 focus:border-black"
                      }`}>
                      <SelectValue placeholder="Select your brand's country of origin" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.brandOrigin && (
                <p className='text-red-500 text-sm mt-1 flex items-center'>
                  <AlertCircle className='h-4 w-4 mr-1' />
                  {errors.brandOrigin.message}
                </p>
              )}
            </div>

            {/* Brand Story */}
            <div>
              <Label
                htmlFor='brandStory'
                className='text-sm font-semibold text-gray-700'>
                Brand Story
              </Label>
              <Textarea
                id='brandStory'
                {...register("brandStory")}
                placeholder="Tell your brand's story - what inspired you, your mission, what makes you unique..."
                className={`mt-1 min-h-[120px] resize-none rounded-2xl transition-colors ${
                  errors.brandStory
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-black focus:ring-black"
                }`}
                disabled={isLoading}
                maxLength={500}
              />
              {errors.brandStory && (
                <p className='text-red-500 text-sm mt-1 flex items-center'>
                  <AlertCircle className='h-4 w-4 mr-1' />
                  {errors.brandStory.message}
                </p>
              )}
            </div>

            {/* Brand Logo */}
            <div>
              <Label className='text-sm font-semibold text-gray-700'>
                Brand Logo *
              </Label>
              <p className='text-xs text-gray-500 mt-1 mb-2'>
                Upload your brand logo (JPG or JPEG format only)
              </p>
              <Controller
                name='brandLogo'
                control={control}
                render={({ field }) => (
                  <FileUpload
                    onFileSelect={field.onChange}
                    accept='image/jpeg,image/jpg'
                    error={errors.brandLogo?.message}
                    disabled={isLoading}
                    maxSize={5 * 1024 * 1024} // 5MB
                  />
                )}
              />
            </div>

            {/* Submit Button */}
            <Button
              type='submit'
              className='w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 h-12 text-white py-3 rounded-full transition-colors duration-200'
              disabled={isLoading || !isValid}>
              {isLoading ? (
                <div className='flex items-center space-x-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  <span>Creating Profile...</span>
                </div>
              ) : (
                "Create Brand Profile"
              )}
            </Button>

            {/* Progress Indicator */}
            <div className='text-center'>
              <p className='text-xs text-gray-500'>
                Step 2 of 4 - Setting up your brand
              </p>
              <div className='w-full bg-gray-200 rounded-full h-2 mt-2'>
                <div
                  className='bg-black h-2 rounded-full'
                  style={{ width: "50%" }}></div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
