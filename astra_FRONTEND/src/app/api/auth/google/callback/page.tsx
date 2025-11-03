// // app/auth/google/callback/page.tsx
// 'use client';

// import { useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';

// export default function GoogleCallbackPage() {
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const code = searchParams.get('code');

//     useEffect(() => {
//         if (!code) return;

//         // Exchange code with backend
//         fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google/callback?code=${code}`, {
//             credentials: 'include'
//         })
//             .then(res => res.json())
//             .then(data => {
//                 // save tokens, redirect user, etc.
//                 localStorage.setItem('auth_token', data.token);
//                 router.push('/dashboard');
//             })
//             .catch(err => {
//                 console.error(err);
//                 router.push('/login');
//             });
//     }, [code, router]);

//     return <p>Signing you in...</p>;
// }
