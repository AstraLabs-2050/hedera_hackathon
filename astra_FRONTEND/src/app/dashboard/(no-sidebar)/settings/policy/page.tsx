"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SaveAction } from "@/components/common/saveAction";

export default function ReturnRefundPolicyPage() {
  return (
    <div className='min-h-screen bg-white rounded-md mb-10'>
      <div className='space-y-8 pb-10'>
        <div className=''>
          <div className='flex justify-between items-center px-4 py-[10px] md:px-8 md:py-4'>
            <h1 className='text-xl font-bold text-black'>
              Return/Refund Policy
            </h1>
            <SaveAction
              onConfirm={async () => {
                await new Promise((res) => setTimeout(res, 2000));
              }}
              successMessage='Policy Settings Saved!'>
              <Button className='rounded-full bg-black text-white hover:bg-gray-800 px-6 py-5 text-sm'>
                Save Settings
              </Button>
            </SaveAction>
          </div>
          <Separator />
        </div>

        <div className='px-4 md:px-8 space-y-6'>
          <div className=''>
            <p className='font-semibold'>Return/Refund Settings</p>
            <p className='text-sm text-gray-500'>
              This clarifies how disputes will be handled in escrow if the
              product is not delivered as expected.
            </p>
          </div>

          <Separator />

          {/* Return Window */}
          <div className='flex gap-4 justify-between flex-wrap items-start'>
            <div className=''>
              <p className='font-semibold'>Return Window</p>
              <p className='text-sm text-gray-500'>
                Set the timeframe customers have to initiate a return after
                purchase.
              </p>
            </div>
            <div className='space-y-5 w-full md:w-[500px]'>
              <Label className='font-semibold text-[#515B6F] text-sm'>
                Return period
              </Label>
              <div className='relative rounded-full flex items-center py-3 px-5 w-full border-gray-300 border'>
                <input
                  type='number'
                  defaultValue='0'
                  className='border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none focus:outline-none p-0 h-auto flex-1 w-full'
                />
                <span className='absolute top-3 left-14 z-50 bg-white text-gray-500'>
                  days from delivery
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Return Condition */}
          <div className='flex gap-4 justify-between flex-wrap items-start'>
            <div className=''>
              <p className='font-semibold'>Return Condition</p>
              <p className='text-sm text-gray-500'>
                Define the acceptable condition for returned items.
              </p>
            </div>
            <div className='space-y-5 w-full md:w-[500px]'>
              <div className='flex items-center space-x-2'>
                <Checkbox id='unworn' defaultChecked />
                <label
                  htmlFor='unworn'
                  className='text-sm font-medium leading-none'>
                  Unworn with original tags attached
                </label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox id='packaging' />
                <label
                  htmlFor='packaging'
                  className='text-sm font-medium leading-none'>
                  Original packaging required
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* NFT Return Policy */}
          <div className='flex gap-4 justify-between flex-wrap items-start'>
            <div className=''>
              <p className='font-semibold'>NFT Return Policy</p>
              <p className='text-sm text-gray-500'>
                Specify how NFTs associated with purchases are handled during
                returns.
              </p>
            </div>
            <div className='w-full md:w-[500px]'>
              <RadioGroup defaultValue='transfer' className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='transfer' id='transfer' />
                  <Label htmlFor='transfer'>
                    Transfer NFT back to store upon successful return
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='burn' id='burn' />
                  <Label htmlFor='burn'>
                    Burn/Destroy NFT upon successful return
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='keep' id='keep' />
                  <Label htmlFor='keep'>
                    Allow customer to keep NFT with partial refund (10% less)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator />

          {/* Return Eligibility */}
          <div className='flex gap-4 justify-between flex-wrap items-start'>
            <div className=''>
              <p className='font-semibold'>Return Eligibility</p>
              <p className='text-sm text-gray-500'>
                Define which collections are eligible for returns.
              </p>
            </div>
            <div className='space-y-5 w-full md:w-[500px]'>
              <RadioGroup defaultValue='all' className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='all' id='all' />
                  <Label htmlFor='all'>
                    All collections are eligible for returns
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='set' id='set' />
                  <Label htmlFor='set'>Set eligibility by collections</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator />

          {/* Refund Methods */}
          <div className='flex gap-4 justify-between flex-wrap items-start'>
            <div className=''>
              <p className='font-semibold'>Refund Methods</p>
              <p className='text-sm text-gray-500'>
                Choose how refunds will be processed.
              </p>
            </div>
            <div className='space-y-5 w-full md:w-[500px]'>
              <RadioGroup defaultValue='original' className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='original' id='original' />
                  <Label htmlFor='original'>Original payment method</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='astra' id='astra' />
                  <Label htmlFor='astra'>Astra Native token</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='choice' id='choice' />
                  <Label htmlFor='choice'>
                    Customer&apos;s choice (payment method or native token)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator />

          {/* Return Processing Time */}
          <div className='flex gap-4 justify-between flex-wrap items-start'>
            <div className=''>
              <p className='font-semibold'>Return Processing Time</p>
              <p className='text-sm text-gray-500'>
                Set expectations for how quickly returns will be processed.
              </p>
            </div>
            <div className='space-y-5 w-full md:w-[500px]'>
              <Label className='font-semibold text-[#515B6F] text-sm'>
                Process returns within
              </Label>
              <div className='relative rounded-full flex items-center py-3 px-5 w-full border-gray-300 border'>
                <input
                  type='number'
                  defaultValue='0'
                  className='border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none focus:outline-none p-0 h-auto flex-1 w-full'
                />
                <span className='absolute top-3 left-14 z-50 bg-white text-gray-500'>
                  business days of receipt
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Return Policy Text */}
          <div className='flex gap-4 justify-between flex-wrap items-start'>
            <div className=''>
              <p className='font-semibold'>Return Policy Text</p>
              <p className='text-sm text-gray-500'>
                This text will be displayed to customers.
              </p>
            </div>
            <div className='space-y-5 w-full md:w-[500px] p-4 rounded-2xl border border-gray-300'>
              <p className='text-gray-500'>
                We want you to be completely satisfied with your purchase. If
                for any reason you&apos;re not happy with your order, you may
                return it within 30 days of delivery. Items must be unworn with
                tags attached and in original packaging. Once received,
                we&apos;ll process your return within 5 business days. Each
                purchase includes a unique NFT certificate of authenticity that
                will be transferred back upon return.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
