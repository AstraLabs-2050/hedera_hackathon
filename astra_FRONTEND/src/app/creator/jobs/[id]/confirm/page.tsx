
'use client';
import { useState } from 'react';
import Image from 'next/image';
import Button from '../../../../components/button';
import Link from 'next/link';

export default function confirmPage() {
    const [isLoading, setIsLoading] = useState(false)
    return (
        <div className='h-[100dvh] bg-[#FAFAFA] flex items-center justify-center font-[ClashGrotesk-regular]'>
            <div className='bg-white p-6 rounded-3xl max-w-[505px]'>
                <div className='flex flex-col items-center justify-center max-w-md w-full'>
                    <Image
                        src='/astra-img.png'
                        alt='astra-image'
                        width={300}
                        height={300}
                        quality={100}
                        className='pb-6 rounded-xl w-full'
                    />
                    <div className='flex flex-col items-start justify-center'>
                        <h4 className='pb-6 text-left text-xl font-bold'>Your Application has been successfully sent to the Job Creator!</h4>
                        <p className='text-base'>You will be notified when the brand has made a decision on your application.</p>
                    </div>
                    <Link href='/creator/dashboard' className='w-full' >
                        <Button
                            label={isLoading ? "loading" : "Go to dashboard"}
                            // type="submit"
                            fullWidth={false}
                            disabled={isLoading}
                            className='rounded-3xl my-2 w-full'
                            onClick={() => { }}
                        />
                    </Link>
                </div>
            </div>
        </div>
    )
}