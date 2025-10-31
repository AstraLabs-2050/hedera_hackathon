"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState, useEffect } from "react";
import { formatCurrency } from "./../../../dashboard/(with-sidebar)/utils/format";
import { redirect } from "next/navigation";

interface Design {
  id: string | number;
  image: string;
  title: string;
  by: string;
  shipsFrom: string;
  price: number;
  preOrder: boolean;
  category: string;
  description: string;
  brandStory: string;
  deliveryWindow: string;
}

export default function DesignPage({
  params,
}: {
  params: { designId: string };
}) {
  const designId = params.designId;
  const [design, setDesign] = useState<Design | null>(null);

  useEffect(() => {
    if (!designId) {
      redirect("/marketplace");
    }
    const stored = localStorage.getItem("selectedDesign");
    if (stored) {
      setDesign(JSON.parse(stored));
    }

    return () => {
      localStorage.removeItem("selectedDesign");
    };
  }, []);

  if (!design) {
    return (
      <div className='text-center py-12 text-gray-400'>
        Loading design details...
      </div>
    );
  }

  return (
    <main className='dark bg-background text-foreground font-sans relative'>
      <div className='max-w-5xl py-16 mx-auto p-6 rounded-3xl overflow-hidden shadow-xs'>
        <div className='flex flex-col gap-5 md:flex-row'>
          {/* Left: Image */}
          <div className='md:w-1/2'>
            <Image
              src={design.image}
              alt={`${design.title} by ${design.by}`}
              width={600}
              height={800}
              className='object-cover object-top w-full h-full rounded-2xl'
            />
          </div>

          {/* Right: Details */}
          <div className='md:w-1/2 p-6 space-y-4 border border-primary/40 rounded-2xl'>
            <p className='text-muted-foreground'>By {design.by}</p>
            <p className='text-2xl font-bold'>{formatCurrency(design.price)}</p>

            <p className='text-muted-foreground text-sm'>
              {design.description}
            </p>
            <p className='text-muted-foreground text-sm'>{design.brandStory}</p>

            <div className='space-y-2'>
              <p className='text-sm font-semibold text-primary/90'>Lead Time</p>
              <div className='inline-block bg-gray-100 border border-gray-300 text-gray-800 px-4 py-2 rounded-full text-sm'>
                Made to order: {design.deliveryWindow}
              </div>
            </div>

            <div className='space-y-2'>
              <p className='text-sm font-semibold text-primary/90'>
                Ships from
              </p>
              <div className='inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm border border-gray-300'>
                {design.shipsFrom}
              </div>
            </div>

            <div className='bg-gray-100 p-4 rounded-lg text-sm space-y-3 text-gray-600 border border-gray-300'>
              <div className='flex items-center space-x-2'>
                <Image
                  src='/innovation_starIcon.png'
                  alt='Star icon representing innovation'
                  width={22}
                  height={22}
                  className='h-[22px] w-auto'
                />
                <span className='font-semibold'>Astra Escrow</span>
              </div>
              <p>
                Escrow (x) all funds from items purchased will remain escrow
                until clothing is delivered.
              </p>
            </div>

            <div className='space-y-2'>
              <p className='text-sm font-semibold text-primary/90'>Quantity</p>
              <div className='flex space-x-2'>
                <div className='flex items-center '>
                  <Input
                    placeholder='0'
                    type='number'
                    className='py-5 rounded-full ring-1 ring-gray-300 w-[100px]'
                  />
                </div>
                <Button className='flex-1 py-6 rounded-full'>
                  Pay Into Escrow
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
