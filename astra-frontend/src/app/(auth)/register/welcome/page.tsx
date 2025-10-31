"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function WelcomePage() {
  const router = useRouter();

  const handleCreateCollection = () => {
    router.push("/dashboard/aiagent/chat");
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-8'>
        <div className='bg-white rounded-2xl border border-gray-400 p-8 shadow-sm'>
          <div className='text-center'>
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

            <div className='space-y-6'>
              <h2 className='text-2xl font-semibold text-gray-900'>
                Welcome to Astra
              </h2>

              <p className='text-gray-600 text-center'>
                Create your first collection with AI to start showcasing your
                fashion ideas.
              </p>

              <Button
                onClick={handleCreateCollection}
                className='w-full bg-black hover:bg-gray-800 h-12 text-white py-3 rounded-full'>
                Create a Collection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
