'use client';

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import Input from '../../components/input';
import Button from '../../components/button';
import { loginMaker } from '../../../utils/makerApi';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { requestWithAuth } from '../../hooks/useJob';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!email || !password) return;
        setIsLoading(true);

        try {
            const res = await loginMaker({ email, password });
            toast.success('Login successful!');

            const jobsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/maker/jobs`;
      mutate(jobsUrl, requestWithAuth(jobsUrl));

            // Redirect to dashboard
            router.push('/creator/dashboard');
        } catch (err: any) {
            toast.error(err?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[100dvh] font-[ClashGrotesk-regular]">
            {/* Left login form */}
            <div className="flex items-center w-full lg:w-[53vw] justify-center px-4 lg:px-0 min-h-screen lg:min-h-0">
                <div className="flex flex-col w-full max-w-[440px] lg:w-[440px] items-center justify-center">
                    <h2 className="text-2xl lg:text-3xl font-semibold mb-2 text-center lg:text-left">
                        Welcome Back
                    </h2>
                    <p className="text-base text-gray-600 mb-6 text-center lg:text-left">
                        Login to access your dashboard and see available jobs.
                    </p>

                    <form className="w-full" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <div className="flex flex-col gap-3 mb-3 w-full">
                            <Input
                                placeholder="Email"
                                type="email"
                                required
                                value={email}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                className="rounded-xl !w-full lg:!w-[436px]"
                            />

                            <Input
                                placeholder="Password"
                                type="password"
                                required
                                value={password}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                className="rounded-xl !w-full lg:!w-[436px]"
                            />
                        </div>

                        <div className="flex justify-center mt-4">
                            <Button
                                label={isLoading ? 'Logging in...' : 'Login'}
                                fullWidth={false}
                                disabled={isLoading || !email || !password}
                                className="rounded-xl !w-full lg:!w-[436px]"
                                onClick={handleSubmit}
                            />
                        </div>
                    </form>
                </div>
            </div>

            {/* Right-side image */}
            <div className="hidden lg:block relative w-[47vw] h-[100vh]">
                <Image
                    src="/register-img.jpg"
                    alt="Login image"
                    fill
                    className="object-cover"
                />
                <Image
                    src="/astras-logo.png"
                    alt="Astra logo"
                    width={349}
                    height={83.5}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
            </div>
        </div>
    );
}
