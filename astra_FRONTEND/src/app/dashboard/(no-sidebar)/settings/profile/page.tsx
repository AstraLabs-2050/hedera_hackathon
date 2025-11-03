"use client";

import { SaveAction } from "@/components/common/saveAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function BrandProfileSettings() {
  return (
    <div className='min-h-screen bg-white rounded-md mb-10'>
      <div className='space-y-8 pb-10'>
        {/* Page Header */}
        <div>
          <div className='flex justify-between items-center px-4 py-[10px] md:px-8 md:py-4'>
            <h1 className='text-xl font-bold'>Brand Profile Settings</h1>

            <SaveAction
              onConfirm={async () => {
                await new Promise((res) => setTimeout(res, 2000));
              }}
              successMessage='Brand Profile Saved!'>
              <Button className='rounded-full bg-black text-white hover:bg-gray-800 px-8 py-5'>
                Save Profile
              </Button>
            </SaveAction>
          </div>

          <Separator />
        </div>

        {/* Brand Information */}
        <div className='px-4 md:px-8 space-y-6'>
          <div>
            <p className='font-semibold'>Brand Information</p>
            <p className='text-gray-500'>
              This is your brand information that you can update anytime.
            </p>
          </div>

          <Separator />

          {/* Brand Name */}
          <div className='flex gap-4 justify-between flex-wrap items-start'>
            <div>
              <p className='font-semibold'>Brand Details</p>
            </div>

            <div className='space-y-6 w-full md:w-[500px]'>
              {/* Brand Name */}
              <div>
                <Label className='font-semibold text-[#515B6F]'>
                  Brand Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  placeholder='Enter your brand name'
                  defaultValue='Lumina Dusk'
                  className='rounded-full border-gray-300 bg-white py-6 text-gray-500 placeholder-gray-400'
                />
              </div>

              {/* Brand Origin */}
              <div>
                <Label className='font-semibold text-[#515B6F]'>
                  Brand Origin <span className='text-red-500'>*</span>
                </Label>
                <Input
                  placeholder='Enter brand origin'
                  defaultValue='Copenhagen, Denmark'
                  className='rounded-full border-gray-300 bg-white py-6 text-gray-500 placeholder-gray-400'
                />
              </div>

              {/* Brand Story */}
              <div>
                <Label className='font-semibold text-[#515B6F]'>
                  Brand Story
                </Label>
                <Textarea
                  placeholder='Write your brand story here...'
                  defaultValue={`Lumina Dusk merges Scandinavian minimalism with avant-garde elements, creating versatile pieces that transition seamlessly from day to night. Founded in 2019 by textile designer Mia Jensen, the brand emphasizes sustainable materials and ethical manufacturing. Each collection draws inspiration from the unique Nordic light conditions, where crisp daylight gradually transforms into lingering twilight. This duality is reflected in the brand's signature contrasting textures and adaptable silhouettes that honor form and function equally.`}
                  className='rounded-xl border-gray-300 p-4 bg-white text-gray-500 placeholder-gray-400 min-h-[180px]'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
