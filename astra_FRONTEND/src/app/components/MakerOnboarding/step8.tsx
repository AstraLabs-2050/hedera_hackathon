'use client';
import { useState } from 'react';
import Image from 'next/image';
import Button from '../button';
import { useRouter } from "next/navigation";

export default function step8() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false)
    return (
        <div className='bg-white p-6 rounded-3xl max-w-[505px]'>
            <div className='flex flex-col items-center justify-center max-w-md w-full'>
                <Image
                    src='/astra-img.png'
                    alt='astra-image'
                    // fill
                    width={300}
                    height={300}
                    quality={100}
                    className='pb-6 rounded-xl w-full'
                />
                <div className='flex flex-col items-start justify-center'>
                <h3 className='pb-6 font-bold text-left text-xl'>Welcome to ASTRA Creators!</h3>
                <p className='pb-6 text-left text-base'>Your application is currently under review, you would receive a confirmation message soon.</p>
                </div>
                <Button
                    label={isLoading ? "loading" : "Proceed to Dashboard"}
                    // type="submit"
                    fullWidth={false}
                    disabled={isLoading}
                    className='rounded-3xl my-2 max-w-[220px] w-full'
                    onClick={() => router.push("/creator/dashboard")}
                />
            </div>
        </div>
    )
}