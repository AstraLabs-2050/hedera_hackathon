"use client";

import { useState, useEffect } from "react";
import DesignsTabs from "./tabs";
import DesignList from "./designList";
import Loader from "@/app/components/common/Loader";
import api from "@/utils/api.class";
import Link from "next/link";
import Image from "next/image";
import { Design } from "@/types/types";

export default function DesignsPage() {
  const [activeTab, setActiveTab] = useState("my");
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NEW STATE for menu toggle
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.getCreatorInventory();

        if (response.status && response.data) {
          if (response.data.length > 0) {
            setDesigns(response.data);
          }
        }
      } catch {
        setError("Failed to fetch designs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  const handleUnpublish = async (designId: string) => {
    try {
      setDesigns((prevDesigns) =>
        prevDesigns.map((design) =>
          design.id === designId
            ? { ...design, publishedStatus: "minted" as const }
            : design
        )
      );
    } catch {}
  };

  if (loading) {
    return (
      <div className='bg-[#F9F9F9] pt-6 px-6 md:px-[60px] h-full'>
        <div className='mt-10'>
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-[#F9F9F9] pt-6 px-6 md:px-[60px] h-full'>
        <div className='mt-10 text-center'>
          <p className='text-gray-400 italic text-sm mb-4'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='relative bg-[#F9F9F9] pt-6 px-5 md:px-[60px] h-fit min-h-screen'>
      <DesignsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        designs={designs}
      />
      <DesignList
        activeTab={activeTab}
        designs={designs}
        onUnpublish={handleUnpublish}
      />

      {/* Floating button + popup menu */}
      <div className='fixed bottom-[40px] right-8 flex items-end gap-3'>
        {/* Popup Cards */}
        {menuOpen && (
          <div className='flex flex-col gap-2'>
            <Link
              href='/dashboard/aiagent/chat'
              className='bg-white border shadow-md rounded-md px-4 py-2 cursor-pointer hover:bg-gray-50'>
              Create with AI
            </Link>
            <Link
              href='/dashboard/upload-design'
              className='bg-white border shadow-md rounded-md px-4 py-2 cursor-pointer hover:bg-gray-50'>
              Upload a design
            </Link>
          </div>
        )}

        {/* Circle Icon */}
        <div
          className='rounded-full bg-[radial-gradient(circle_at_center,_#f2f2f2_10%,_#DBDBDB_90%)] border border-gray-300 shadow-sm p-3 flex justify-center items-center cursor-pointer'
          onClick={() => setMenuOpen((prev) => !prev)}>
          <Image
            src='/agent.svg'
            alt='agent'
            width={30}
            height={30}
            className='text-white'
          />
        </div>
      </div>
    </div>
  );
}
