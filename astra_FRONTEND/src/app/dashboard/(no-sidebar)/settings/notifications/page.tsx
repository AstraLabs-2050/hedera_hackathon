"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { SaveAction } from "@/components/common/saveAction";

export default function NotificationsPage() {
  return (
    <div className='min-h-screen bg-white rounded-md mb-10'>
      <div className='space-y-8 pb-5'>
        <div className=''>
          <div className='flex justify-between items-center px-4 py-[10px] md:px-8 md:py-4'>
            <h1 className='text-xl font-bold text-black'>Notifications</h1>
          </div>
          <Separator />
        </div>

        <div className='px-4 md:px-8 space-y-6'>
          <div className=''>
            <p className='font-semibold'>Notification Preferences</p>
            <p className='text-gray-500'>
              This is notifications preferences that you can update anytime.
            </p>
          </div>

          <Separator />

          {/* Notification Settings */}

          <div className='flex gap-4 justify-between flex-wrap items-start'>
            <div className=''>
              <p className='font-semibold'>Notification Settings</p>
              <p className='text-gray-500'>
                Customize your preferred notification settings
              </p>
            </div>

            <div className='space-y-5 w-full md:w-[500px]'>
              <div className='flex items-baseline space-x-2'>
                <Checkbox id='inventory' defaultChecked />
                <div className='space-y-2'>
                  <label
                    htmlFor='inventory'
                    className='font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                    Inventory Alerts
                  </label>
                  <p className='text-gray-500'>
                    Manage your product availability effectively with low stock
                    warnings, data-driven restock recommendations, and
                    production timeline reminders.
                  </p>
                </div>
              </div>
              <div className='flex items-start space-x-2'>
                <Checkbox id='platform' />
                <div className='space-y-2'>
                  <label
                    htmlFor='platform'
                    className='font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                    Platform Updates
                  </label>
                  <p className='text-gray-500'>
                    Stay current with the latest platform changes including new
                    creator features, promotional opportunities, and important
                    algorithm updates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='flex justify-end'>
            <SaveAction
              onConfirm={async () => {
                await new Promise((res) => setTimeout(res, 2000));
              }}
              successMessage='Notification preferences updated successful!'>
              <Button className='rounded-full bg-black text-white hover:bg-gray-800 px-6 py-5 text-sm'>
                Update preferences
              </Button>
            </SaveAction>
          </div>
        </div>
      </div>
    </div>
  );
}
