import React from 'react';
import Image from 'next/image';

export default function navbar() {
    return (
        <div className='bg-[#FAFAFA] h-[10dvh] flex items-center px-8 py-4'>
            <Image className="" src="/ASTRA-logo.svg" alt="logo" width={155} height={37} />
        </div>
    )
}