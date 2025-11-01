'use client';

import CreatorSidebar from '../../components/creatorSidebar';
import CreatorNavbar from '../../components/creatorNavbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';


export default function page() {
    const router = useRouter();
    const settings = [
        {
            title: 'Profile Settings',
            desc: 'Your name, contact details and other personal information.',
            icon: '/profile-settings.svg',
            href: '/creator/accountSettings/profile',
        },
        {
            title: 'Password & Security',
            desc: 'Change your password and other account security preferences.',
            icon: '/password-settings.svg',
            href: '/creator/accountSettings/password',
        },
        {
            title: 'Notification Settings',
            desc: 'Notification and alert preferences.',
            icon: '/notification-settings.svg',
            href: '/creator/accountSettings/notifications',
        },
        {
            title: 'Payment Settings',
            desc: 'Setup your payment through Escrow.',
            icon: '/payment-settings.svg',
            href: '/creator/accountSettings/payment',
        },
    ];

    return (
        <div className="flex flex-col h-[100dvh] font-[ClashGrotesk-regular] pb-10">
            <CreatorNavbar />
            <div className="flex flex-1">
                <CreatorSidebar />

                <div className="flex-1 pt-10 px-8 lg:px-16 mt">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {settings.map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.href}
                                className="border border-[#F2F2F2] rounded-xl p-6 flex flex-col gap-3 hover:shadow-md transition max-w-md w-full max-h-72 h-full"
                            >
                                <Image src={item.icon} alt='Settngs-icon' width={50} height={50}/>
                                <h2 className="font-semibold text-lg mt-6">{item.title}</h2>
                                <p className="text-sm text-[#4F4F4F]">{item.desc}</p>
                            </Link>
                        ))}

                        {/* Logout */}
                        <button
                            onClick={() => console.log('logout')}
                            className="border border-[#F2F2F2] rounded-xl p-6 flex flex-col gap-3 text-[#EB3173] hover:shadow-md transition max-w-md w-full max-h-60 h-full"
                        >
                            {/* <FaSignOutAlt size={24} /> */}
                            <Image src='/logout-icon.svg' alt='Settngs-icon' width={50} height={50}/>
                            <h2 className="font-semibold text-left text-lg mt-6">Log Out</h2>
                            <p className="text-sm text-left">Sign out of your account</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
