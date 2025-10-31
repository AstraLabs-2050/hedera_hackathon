'use client';

import { useState } from 'react';
import Step1 from './MakerOnboarding/step1';
import Step2 from './MakerOnboarding/step2';
import Step3 from './MakerOnboarding/step3';
import Step4 from './MakerOnboarding/step4';
import Step5 from './MakerOnboarding/step5';
import Step6 from './MakerOnboarding/step6';
import Step7 from './MakerOnboarding/step7';
import Step8 from './MakerOnboarding/step8';
import Navbar from '../components/navbar';
import { FormData } from '@/types/types';
// import { SessionProvider } from "next-auth/react";

export default function MakerOnboardingForm() {
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState<number[]>([]);
const [formData, setFormData] = useState<FormData>({
  // Step 1
  fullName: '',
  email: '',
password: '',
  // Step 4/5
  profilePicture: null,
  location: '',
  categories: [],
  skills: [],

  // Step 6 – Identity Verification
  personalIdFiles: [] as File[],
  personalIdName: '',
  personalIdCountry: '',
  personalIdExpiry: '',
  isBusiness: '', // "yes" or "no"
  businessCertFile: null,
  businessName: '',
  taxRegistrationNumber: '',
  registrationCountry: '',
  businessType: '',

  // Step 7
  workExperiences: [],

  // Step 8
  uploadedWorks: [],
});


  const goToStep = (nextStep: number) => {
    setHistory((prev) => [...prev, step]);
    setStep(nextStep);
  };

  const handleBack = () => {
    setHistory((prev) => {
      const newHistory = [...prev];
      const previousStep = newHistory.pop();
      if (previousStep !== undefined) setStep(previousStep);
      return newHistory;
    });
  };

  const renderStep = () => {
    const stepProps = { formData, setFormData, onBack: handleBack };

    switch (step) {
      case 1:
        return <Step1 {...stepProps} onNext={() => goToStep(2)} />;
      case 2:
        return <Step2 {...stepProps} onNext={() => goToStep(3)} />;
      case 3:
        return <Step3 {...stepProps} onNext={() => goToStep(4)}/>;
      case 4:
        return <Step4 {...stepProps} onNext={() => goToStep(5)} />;
      case 5:
        return <Step5 {...stepProps} onNext={() => goToStep(6)} />;
      case 6:
        return <Step6 {...stepProps}  onNext={() => goToStep(7)} />;
      case 7:
        return <Step7 {...stepProps} onNext={() => goToStep(8)} />;
      case 8:
        return <Step8 />;
      default:
        return <div>Unknown step</div>;
    }
  };

  const shouldShowProgress = step >= 3 && step <= 7;

return (
  <div className={`flex flex-col ${ step <= 3 || step === 8 ? 'h-[100dvh]' : 'min-h-screen'}`}>
    {shouldShowProgress && <Navbar />}

    <div
      className={`flex justify-center flex-1 ${
        step >= 3 && step <= 8 ? 'bg-[#FAFAFA] pb-12 lg:pb-20' : '' 
      } ${step === 8 ? 'items-center lg:pb-0' : ''}`}
      >
      {renderStep()}
    </div>
  </div>
);
}