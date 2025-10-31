'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';

import MakerOnboardingForm from '@/app/components/MakerOnboardingForm';
import React from 'react'
// import { SessionProvider } from 'next-auth/react';

export default function page() {
  return (
    <div>
        {/* <GoogleOAuthProvider clientId="187863060162-fjut01nu2ik4l34nlgkum9b2do473ead.apps.googleusercontent.com"> */}
        <MakerOnboardingForm />
        {/* </GoogleOAuthProvider> */}
    </div>
  )
}
