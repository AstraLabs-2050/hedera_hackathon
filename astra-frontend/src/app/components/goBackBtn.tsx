"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const GoBackBtn = () => {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard"); // fallback if no browser history
    }
  };
  return (
    <button
      onClick={handleGoBack}
      className='flex items-center gap-1 hover:underline w-fit'>
      <ArrowLeft />
      <p className='font-semibold'>Go Back</p>
    </button>
  );
};

export default GoBackBtn;
