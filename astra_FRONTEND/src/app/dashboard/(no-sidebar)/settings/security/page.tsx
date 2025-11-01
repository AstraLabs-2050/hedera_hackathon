"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleCheck, X as CloseIcon } from "lucide-react";
import { BsTwitterX } from "react-icons/bs";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { FaDiscord } from "react-icons/fa";
import { SaveAction } from "@/components/common/saveAction";

export default function PasswordSecurityPage() {
  return (
    <div className='min-h-screen bg-white  rounded-md mb-10'>
      <div className='space-y-8 pb-10'>
        <div className=''>
          <h1 className='text-xl px-4 py-[10px] md:px-8 md:py-4 font-bold text-black'>
            Password & Security
          </h1>
          <Separator />
        </div>

        <div className='px-4 md:px-8 space-y-6'>
          <div className=''>
            <p className='font-semibold'>Login Information</p>
            <p className='text-sm text-gray-500'>
              This is login information that you can update anytime.
            </p>
          </div>

          <Separator />

          {/* Update Email */}

          <div className='flex gap-4 justify-between flex-wrap items-start'>
            <div className=''>
              <p className='font-semibold'>Update Email</p>
              <p className='text-sm text-gray-500'>
                Update your email address to make sure it&apos;s safe
              </p>
            </div>

            <div className='space-y-5 w-full md:w-[500px]'>
              <div>
                <div className='flex gap-2 items-center'>
                  <span className='font-medium '>jakegyyl@email.com</span>
                  <CircleCheck size={20} className='text-green-500' />
                </div>

                <p className='text-sm text-gray-500'>
                  Your email address is verified.
                </p>
              </div>

              <div>
                <Label className='font-semibold text-sm text-[#515B6F]'>
                  Update Email
                </Label>
                <Input
                  placeholder='Enter your new email'
                  className='rounded-full w-full border-gray-300 bg-white py-6 text-black placeholder-gray-400 mb-4'
                />

                <SaveAction
                  onConfirm={async () => {
                    await new Promise((res) => setTimeout(res, 2000));
                  }}
                  successMessage='Email Updated!'>
                  <Button className='rounded-full bg-black text-white hover:bg-gray-800 px-8 py-5'>
                    Update Email
                  </Button>
                </SaveAction>
              </div>
            </div>
          </div>

          <Separator />

          {/* Update Password */}
          <div className='flex gap-4 justify-between flex-wrap items-start'>
            <div className=''>
              <p className='font-semibold'>New Password</p>
              <p className='text-sm text-gray-500'>
                Manage your password to make sure it is safe
              </p>
            </div>

            <div className='space-y-5 w-full md:w-[500px]'>
              <div>
                <Label className='font-semibold text-sm text-[#515B6F]'>
                  Old Password
                </Label>
                <Input
                  placeholder='Enter your old password'
                  type='password'
                  className='rounded-full border-gray-300 bg-white py-6 text-black placeholder-gray-400'
                />
                <p className='text-sm text-gray-500 pt-1'>
                  Minimum 8 characters
                </p>
              </div>
              <div>
                <Label className='font-semibold text-[#515B6F] text-sm'>
                  New Password
                </Label>
                <Input
                  placeholder='Enter your old password'
                  type='password'
                  className='rounded-full border-gray-300 bg-white py-6 text-black placeholder-gray-400'
                />
                <p className='text-sm text-gray-500 pt-1'>
                  Minimum 8 characters
                </p>

                <SaveAction
                  onConfirm={async () => {
                    await new Promise((res) => setTimeout(res, 2000));
                  }}
                  successMessage='Password Updated Successfully!'>
                  <Button className='rounded-full bg-black text-white py-5 hover:bg-gray-800 px-8 mt-4'>
                    Change Password
                  </Button>
                </SaveAction>
              </div>
            </div>
          </div>

          <Separator />

          {/* Socials */}

          <div className='flex gap-4 justify-between flex-wrap items-start'>
            <div className=''>
              <p className='font-semibold'>Social Login</p>
            </div>

            <div className='space-y-5 md:w-[500px]'>
              <div className='flex items-center gap-3'>
                <div className=' flex h-10 w-10 items-center justify-center rounded-full bg-gray-100'>
                  <FcGoogle size={25} />
                </div>

                <Button
                  variant='outline'
                  className='rounded-full border-gray-300 hover:bg-gray-100 py-[20px] pr-10 border text-black'
                  disabled>
                  jakegyll@gmail.com
                </Button>

                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-full text-red-500 hover:bg-red-100 p-4 border border-gray-300'>
                  <CloseIcon className='h-5 w-5' />
                </Button>
              </div>

              <div className='flex items-center gap-3'>
                <div className=' flex h-10 w-10 items-center justify-center rounded-full bg-gray-100'>
                  <BsTwitterX size={20} />
                </div>

                <Button
                  variant='outline'
                  className='rounded-full border-gray-300 text-black hover:bg-gray-100'>
                  Connect X
                </Button>
              </div>

              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100'>
                  <FaDiscord size={25} color='#5d69f1' />
                </div>

                <Button
                  variant='outline'
                  className='rounded-full border-gray-300 text-black hover:bg-gray-100'>
                  Connect Discord
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
