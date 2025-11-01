"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { SaveAction } from "@/components/common/saveAction";
import { useDesignContext } from "../../../layout";
import api from "@/utils/api.class";
import Notification from "@/app/components/notification";

const getPublishData = (step: string) => {
  if (typeof window !== "undefined") {
    try {
      const saved = sessionStorage.getItem(`publish_${step}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
  return null;
};

const clearPublishData = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("publish_step1");
    sessionStorage.removeItem("publish_step2");
  }
};

const parseCurrency = (value: string): number => {
  if (!value) return 0;
  return parseFloat(value.replace(/,/g, "")) || 0;
};

interface PreviewData {
  pricePerOutfit: string;
  quantityAvailable: string;
  deliveryWindow: string;
  brandStory: string;
  regionOfDelivery: string;
}

export default function PreviewScreenPage() {
  const { design, loading } = useDesignContext();
  const router = useRouter();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const step1Data = getPublishData("step1");
    const step2Data = getPublishData("step2");

    if (!step1Data || !step2Data) {
      router.push(`/dashboard/publish/${design?.id}`);
      return;
    }

    setPreviewData({ ...step1Data, ...step2Data });
  }, [design?.id, router]);

  if (loading || !design || !previewData) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  const handlePublishNow = async () => {
    setIsPublishing(true);
    try {
      const publishData = {
        designId: design.id,
        pricePerOutfit: parseCurrency(previewData.pricePerOutfit),
        quantityAvailable: parseInt(previewData.quantityAvailable, 10),
        deliveryWindow: previewData.deliveryWindow,
        brandStory: previewData.brandStory,
        regionOfDelivery: previewData.regionOfDelivery,
      };

      const response = await api.publishToMarketplace(publishData);
      clearPublishData();

      setTimeout(() => router.replace("/dashboard/design"), 2000);

      return { success: true, data: response.data };
    } catch (e) {
      const message = "Error publishing to marketplace. Please try again.";
      Notification.error(message);
      throw new Error(message);
    } finally {
      setIsPublishing(false);
    }
  };

  const displayPrice = parseCurrency(previewData.pricePerOutfit).toFixed(2);
  const displayQuantity = previewData.quantityAvailable;

  return (
    <div className='w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6 py-8 md:px-[50px] flex flex-col items-center'>
      <h1 className='text-2xl font-bold mb-2 text-center'>Preview Screen</h1>

      <p className='text-gray-600 mb-8 text-center'>
        Here&apos;s how your design will look in the marketplace.
      </p>

      <div className='w-full bg-white rounded-xl overflow-hidden'>
        <div className='flex flex-col gap-5 md:flex-row md:items-stretch mb-8'>
          <div className='md:w-1/2 flex'>
            <div className='flex-1 rounded-lg overflow-hidden bg-gray-100'>
              <Image
                src={design.designLink}
                alt={`${design.name} Design`}
                width={600}
                height={800}
                className='object-cover object-top w-full h-full rounded-2xl'
              />
            </div>
          </div>

          <div className='md:w-1/2 p-6 space-y-3 border border-primary/40 rounded-2xl'>
            <div>
              <h2 className='text-xl font-bold'>{design.name}</h2>
              <p className='text-sm text-muted-foreground'>By Creator</p>

              <div className='text-xl font-bold mt-3 flex items-center gap-1'>
                <Image src='/usdc.png' alt='USDC logo' width={20} height={20} />
                ${displayPrice}
              </div>
            </div>

            <p className='text-sm text-muted-foreground leading-relaxed'>
              {previewData.brandStory}
            </p>

            <div className='mb-6 space-y-2'>
              <p className='text-sm font-semibold text-primary/90'>Lead Time</p>
              <div className='inline-block bg-gray-100 border border-gray-300 text-gray-800 px-4 py-2 rounded-full text-xs'>
                Made to order: {previewData.deliveryWindow}
              </div>
            </div>

            <div className='mb-6 space-y-2'>
              <p className='text-sm font-semibold text-primary/90'>
                Quantity Available
              </p>
              <div className='bg-gray-100 border border-gray-300 text-gray-800 px-4 py-2 rounded-full text-xs flex items-center gap-2'>
                <span>{displayQuantity} pieces</span>
              </div>
            </div>

            <div className='flex items-start gap-8'>
              <div className='space-y-2'>
                <p className='text-sm font-semibold text-primary/90'>
                  Ships to
                </p>
                <div className='inline-block bg-gray-100 text-gray-800 px-4 py-1 rounded-full text-sm border border-gray-300'>
                  {previewData.regionOfDelivery}
                </div>
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
                All funds from items purchased will remain in escrow until
                clothing is delivered.
              </p>
            </div>
          </div>
        </div>

        <div className='w-full flex flex-col sm:flex-row gap-4 justify-center items-center'>
          <SaveAction
            onConfirm={handlePublishNow}
            successMessage='Design published successfully!'
            confirmTitle='Publish to Marketplace?'
            confirmDescription={`This will publish "${design.name}" at ${displayPrice} with ${displayQuantity} pieces available.`}>
            <Button
              className='flex-1 w-full px-8 bg-black hover:bg-gray-800 text-white font-medium rounded-lg h-12 text-base transition-colors duration-200'
              disabled={isPublishing}>
              {isPublishing ? "Publishing..." : "Publish Now"}
            </Button>
          </SaveAction>

          <Button
            onClick={() => router.back()}
            variant='outline'
            className='w-full max-w-xs px-8 border-gray-300 text-gray-700 hover:opacity-70 font-medium rounded-lg h-12 text-base transition-colors duration-200'
            disabled={isPublishing}>
            Edit Details
          </Button>
        </div>
      </div>
    </div>
  );
}
