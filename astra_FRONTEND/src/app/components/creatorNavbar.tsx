'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function CreatorNavbar() {
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
    }, []);

    const profilePic = user?.profilePicture;

    return (
        <nav className='h-[10dvh] border-b border-b-[#F2F2F2] w-full'>
            <div className='flex items-center justify-between gap-4 sm:gap-6 md:gap-8 h-full px-4 sm:px-6 md:px-8 lg:px-12'>
                {/* Logo */}
                <Image
                    src='/astra-logo.svg'
                    alt='astra-logo'
                    width={100}
                    height={100}
                    className='w-[90px] sm:w-[100px] lg:w-[120px] h-auto'
                />

                {/* Right Section */}
                <div className='flex items-center gap-3 sm:gap-5 md:gap-6'>

                    {/* Astra Coin Balance */}
                    <span className='flex items-center gap-2 sm:gap-3 font-medium text-xs sm:text-sm md:text-base bg-[#F2F2F2] px-2.5 sm:px-3.5 md:px-4 py-1.5 rounded-3xl whitespace-nowrap'>
                        <Image
                            src='/astraCoin.png'
                            alt='astra-coin-logo'
                            width={20}
                            height={20}
                            className='w-[18px] sm:w-[22px] md:w-[26px] h-auto'
                        />
                        <p className='flex items-center gap-1'>
                            0.00 <strong className='font-semibold'>ASTRAS</strong>
                        </p>
                    </span>

                    {/* Notification Icon */}
                    <Image
                        src='/notification.svg'
                        alt='notification'
                        width={16}
                        height={16}
                        className='w-[14px] sm:w-[16px] md:w-[18px] h-auto'
                    />

                    {/* Profile Picture */}
                    {profilePic ? (
                        // If user has profile picture, show it as-is
                        <Image
                            src={profilePic}
                            alt='Profile-picture'
                            width={36}
                            height={36}
                            className='w-[36px] sm:w-[44px] md:w-[50px] h-auto rounded-full'
                        />
                    ) : (
                        // Placeholder with circular background
                        <div className='w-[36px] sm:w-[44px] md:w-[50px] h-[36px] sm:h-[44px] md:h-[50px] rounded-full bg-[#F8F8F8] flex items-center justify-center'>
                            <Image
                                src='/user-fill.png'
                                alt='Profile-placeholder'
                                width={24}
                                height={24}
                                className='w-[30px] h-[30px]'
                            />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
