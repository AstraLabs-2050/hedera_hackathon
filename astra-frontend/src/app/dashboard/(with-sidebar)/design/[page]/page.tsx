"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQRCode } from "next-qrcode";
import * as htmlToImage from "html-to-image";
import GoBackBtn from "@/app/components/goBackBtn";
import Loader from "@/app/components/common/Loader";
import api from "@/utils/api.class";
import { Design } from "@/types/types";

export default function PublishedPage() {
  const params = useParams<{ page: string }>();
  const { Canvas } = useQRCode();
  const hiddenRef = useRef(null);
  const [instruction, setInstruction] = useState(false);
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDesignById = async (designId: string) => {
      try {
        setLoading(true);
        setError(null);

        // Make the real API call
        const response = await api.getCreatorInventoryById(designId);

        if (response.status && response.data) {
          // Transform API response to match our Design interface
          const transformedDesign: Design = {
            id: response.data.id,
            name: response.data.name,
            price: response.data.price.toString(), // Convert number to string
            quantity: response.data.quantity,
            publishedStatus: response.data.publishedStatus,
            designLink: response.data.designLink,
            lastUpdated: response.data.lastUpdated,
          };

          setDesign(transformedDesign);
        } else {
          throw new Error(response.message || "Failed to fetch design");
        }
      } catch (err) {
        console.error("Error fetching design:", err);

        // Fallback to mock data if API call fails or design not found
        console.warn(
          `Design ${designId} not found in API, using fallback data`
        );

        const mockDesign: Design = {
          id: designId,
          name: "Sample Design Collection", // Dummy title for fallback
          price: "150.00",
          quantity: 1,
          publishedStatus: "listed",
          designLink:
            "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
          lastUpdated: new Date().toISOString(),
        };

        setDesign(mockDesign);

        // Set error message but still show the fallback design
        if (err instanceof Error) {
          console.warn("Using fallback design due to:", err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (params.page) {
      fetchDesignById(params.page);
    }
  }, [params.page]);

  const handleDownload = async () => {
    if (!hiddenRef.current || !design) return;

    setInstruction(true);
    // Wait a tick so images & canvas render
    await new Promise((res) => setTimeout(res, 300));

    try {
      const dataUrl = await htmlToImage.toPng(hiddenRef.current, {
        quality: 1,
        backgroundColor: "#fff",
        cacheBust: true, // ensures fresh load
      });

      const link = document.createElement("a");
      link.download = `${design.name || "qr-card"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to capture:", err);
    } finally {
      // Reset instruction state after download
      setTimeout(() => setInstruction(false), 100);
    }
  };

  const CardInner = ({ showInstruction }: { showInstruction: boolean }) => (
    <div className='flex flex-col w-full max-w-md gap-6 border border-primary/30 px-10 py-5 bg-white rounded-xl shadow-sm'>
      <div className='flex justify-center items-center'>
        <Image
          src='/astraLogo.svg'
          alt='Astra brand logo'
          width={90}
          height={37}
          className='w-[90px] h-auto'
          priority
          unoptimized
          sizes='90px'
        />
      </div>
      <div className='flex flex-col items-center gap-3'>
        <h2 className='text-base font-semibold'>{design?.name}</h2>
        <p className='text-[#4F4F4F] text-center font-normal'>
          Your collection is now live and ready for buyers
        </p>
        <Canvas
          text={`https://example.com/astra_shoppers/${design?.id}`}
          options={{
            errorCorrectionLevel: "M",
            margin: 3,
            scale: 4,
            width: 200,
          }}
        />
        {showInstruction ? (
          <p className='text-center text-sm font-medium text-gray-600 mt-3'>
            Scan the QR code to explore this collection
          </p>
        ) : (
          <div className='space-y-3'>
            <Button
              onClick={handleDownload}
              variant='default'
              className='w-full rounded-full'>
              Download to your device
            </Button>
            <Button
              variant='outline'
              className='w-full rounded-full border border-primary'
              onClick={() => setInstruction(true)}>
              Preview QR Code
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className='flex flex-col bg-[#F9F9F9] pt-6 px-6 md:px-[60px] w-full h-[95vh] md:h-screen'>
        <div className='fixed left-4 md:left-[280px] md:top-24'>
          <GoBackBtn />
        </div>

        <div className='w-full mt-6'>
          <Loader />
        </div>
      </div>
    );
  }

  // Only show error state if we have an error AND no design (fallback failed)
  if (error && !design) {
    return (
      <div className='flex flex-col bg-[#F9F9F9] pt-6 px-6 md:px-[60px] w-full h-[95vh] md:h-screen'>
        <div className='fixed left-4 md:left-[280px] md:top-24'>
          <GoBackBtn />
        </div>

        <div className='flex items-center justify-center w-full mt-6 md:mt-2'>
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <p className='text-red-500 text-lg font-medium mb-2'>
              Failed to load design
            </p>
            <p className='text-gray-500 mb-4'>
              {error || "The design you're looking for couldn't be loaded."}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant='outline'
              className='px-4 py-2'>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='relative flex flex-col items-center justify-start bg-[#F9F9F9] px-6 md:px-[60px] w-full h-full'>
      <div className='fixed left-4 md:left-[280px] md:top-24'>
        <GoBackBtn />
      </div>

      <div className='flex items-center justify-center w-full'>
        <div ref={hiddenRef} className='p-8'>
          <CardInner showInstruction={instruction} />
        </div>
      </div>

      {/* Optional: Show a subtle indicator if using fallback data */}
      {design && design.name === "Sample Design Collection" && (
        <div className='fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-xs'>
          Using sample data
        </div>
      )}
    </div>
  );
}
