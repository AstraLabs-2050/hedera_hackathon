"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { IoShirtOutline } from "react-icons/io5";
import { useDesignContext } from "../../layout";

export default function Page() {
  const { design } = useDesignContext(); // Get design data from layout
  const [selectedMaker, setSelectedMaker] = useState(null);
  const router = useRouter();

  const handleSelect = (type: string) => {
    setSelectedMaker(type);
  };

  // Format the date
  const formattedDate = new Date(design.lastUpdated).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <>
      {/* Main Card */}
      <div className='w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6 py-8 md:px-[65px] flex flex-col items-center'>
        {/* Title */}
        <h1 className='text-lg font-[ClashGrotesk-semibold] mb-8'>
          Hire a Maker
        </h1>

        {/* Design Card */}
        <div className='border flex items-center w-full gap-3 md:gap-[16px] p-3 rounded-xl overflow-hidden border-gray-300 shadow-sm bg-white mb-5'>
          <div className='h-[150px] w-[130px] md:w-fit flex-shrink-0'>
            <Image
              src={design.designLink}
              alt={design.name}
              width={200}
              height={150}
              className='w-[200px] h-full object-cover object-top rounded-lg'
            />
          </div>

          <div className='flex flex-col gap-2 '>
            <h3 className='font-medium'>{design.name}</h3>
            <div className='flex flex-col gap-2 text-sm text-gray-500'>
              <span className='flex items-center gap-1'>
                <Image src='/USDC.svg' alt='usdc logo' width={16} height={16} />{" "}
                {design.price}
              </span>
              <span className='flex items-center gap-1'>
                <IoShirtOutline size={16} /> {design.quantity}
              </span>
            </div>
            <Link
              href='/'
              className='text-xs text-blue-500 hover:text-blue-700 underline truncate w-[160px] md:w-[250px]'>
              astra.com/{design.name.toLowerCase().replace(/\s+/g, "-")}
              -collection{design.id.slice(-6)}
            </Link>
            <p className='text-xs md:text-sm text-gray-400'>
              Last Updated {formattedDate}
            </p>
          </div>
        </div>

        {/* Select another design */}
        <Link
          href='/dashboard/design'
          className='text-blue-500 text-sm font-semibold mb-10 underline'>
          Select another design
        </Link>

        {/* Choose Maker Subtitle */}
        <p className='text-lg mb-8 text-center font-[ClashGrotesk-medium]'>
          Choose what kind of Maker you need for this job.
        </p>

        {/* Maker Options */}
        <div className='w-full flex flex-col md:flex-row justify-center gap-4 mb-10'>
          {/* Digital Creator */}
          <label
            className={`relative flex flex-col items-center p-6 md-px-8 md:py-10 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedMaker === "digital"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:shadow-sm"
            }`}>
            <input
              type='radio'
              name='maker'
              value='digital'
              checked={selectedMaker === "digital"}
              onChange={() => handleSelect("digital")}
              className='hidden'
              aria-label='Select Digital Creator'
            />
            <div className='w-14 h-14 rounded-full flex items-center justify-center mb-4'>
              <Image
                src='/maker_digital.png'
                alt='digital creator'
                width={56}
                height={56}
                className='rounded-full object-cover w-14 h-auto'
              />
            </div>
            <div className='space-y-2 text-center'>
              <h3 className='text-base font-medium'>Digital Creator</h3>
              <p className='text-sm text-gray-500'>
                Create CLO3D garment, AR Try-on filter, 3D mockup
              </p>
            </div>
            {selectedMaker === "digital" && (
              <div className='absolute top-3 right-3 w-5 h-5 md:w-6 md:h-6 border-2 border-blue-500 rounded-full bg-white'>
                <div className='w-3 h-3 md:w-4 md:h-4 mt-0.5 ml-0.5 md:mt-0.5 md:ml-0.5 bg-blue-500 rounded-full'></div>
              </div>
            )}
          </label>

          {/* Physical Maker */}
          <label
            className={`relative flex flex-col items-center p-6 md-px-8 md:py-10 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedMaker === "physical"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}>
            <input
              type='radio'
              name='maker'
              value='physical'
              checked={selectedMaker === "physical"}
              onChange={() => handleSelect("physical")}
              className='hidden'
              aria-label='Select Physical Maker'
            />
            <div className='w-14 h-14 rounded-full flex items-center justify-center mb-4'>
              <Image
                src='/maker_physical.png'
                alt='physical maker'
                width={56}
                height={56}
                className='rounded-full object-cover w-14 h-auto'
              />
            </div>
            <div className='space-y-2 text-center'>
              <h3 className='text-base font-medium'>Physical Maker</h3>
              <p className='text-sm text-gray-500'>
                Tailor, Small-batch producer, Pattern cutter, etc.
              </p>
            </div>
            {selectedMaker === "physical" && (
              <div className='absolute top-3 right-3 w-5 h-5 md:w-6 md:h-6 border-2 border-blue-500 rounded-full bg-white'>
                <div className='w-3 h-3 md:w-4 md:h-4 mt-0.5 ml-0.5 md:mt-0.5 md:ml-0.5 bg-blue-500 rounded-full'></div>
              </div>
            )}
          </label>
        </div>

        {/* Next Button */}
        <Button
          onClick={() => router.push(`/dashboard/hire/${design.id}/jobdetails`)}
          className='w-full max-w-sm bg-primary font-medium rounded-lg h-12 disabled:cursor-not-allowed'
          disabled={!selectedMaker}>
          Next
        </Button>
      </div>
    </>
  );
}
