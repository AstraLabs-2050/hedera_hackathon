"use client"
import Image from 'next/image'
import React from 'react'
import Button from '../components/button'
import { useRouter } from 'next/navigation'

function Page() {
  const router = useRouter()
  
  const handleCreateCollection = () => {
    // Redirect to dashboard when button is clicked
    router.push('/dashboard/aiagent')
  }

  return (
    <div
      className='w-screen h-screen flex items-center justify-center'
      style={{
        backgroundImage: 'url("loginBg.png")'
      }}
    >
      <div className='w-[516px] h-auto rounded-[16px] border border-[#000000] py-[24px] px-[40px] gap-[10px] flex flex-col items-center justify-center bg-white'>
        <Image className='mb-2' src="/logo.png" alt="logo" width={155} height={37} />
        <div className='mb-3 flex flex-col items-center justify-center'>
          <h2 className='font-[ClashGrotesk-Medium] font-[500] text-[32px]'>Welcome to Astra</h2>
          <p className='text-[400] text-[18px] text-center'>Create your first collection with AI to start showcasing your fashion ideas.</p>
        </div>
        <Button label='Create a Collection' onClick={handleCreateCollection} />
      </div>
    </div>
  )
}

export default Page