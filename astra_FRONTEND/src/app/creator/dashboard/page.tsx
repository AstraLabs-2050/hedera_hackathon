'use client';

import React, { useState, useEffect } from 'react';
import CreatorSidebar from '../../components/creatorSidebar';
import CreatorNavbar from '../../components/creatorNavbar';
import Image from 'next/image';
import JobCard from '../../components/JobCard';
import { useSavedJobs } from '../../hooks/useSavedJobs';
import { useJobs } from '../../hooks/useJob';
import ScrollToTopButton from '../../components/ScrollToTopButton';

export default function Page() {
  const [activeTab, setActiveTab] = useState<'recent' | 'saved'>('recent');
  const [user, setUser] = useState<any | null>(null); // add state for logged-in user
  const { savedJobIds } = useSavedJobs();
  const { jobs } = useJobs();
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoadMore = () => {
    setLimit((prev) => prev + 20);
  };

  const hasMore = jobs && limit < jobs.length;

  return (
    <div className="flex flex-col min-h-screen font-[ClashGrotesk-regular]">
      <CreatorNavbar />

      <div className="flex flex-1">
        <CreatorSidebar />

        <div className="flex-1 pt-16 pb-6 px-8 lg:px-16">
          {/* Welcome Header */}
          <div className="flex justify-between items-center pb-12">
            <div>
              <h2 className="text-xl lg:text-3xl font-semibold">
              Welcome {user?.fullName?.trim().split(' ')[0]}, 👋
              </h2>
              <p className="text-sm lg:text-xl text-[#4F4F4F] w-[95%] lg:w-full">
                Here are the available jobs waiting for you to apply.
              </p>
            </div>

            <button className="flex items-center justify-between gap-2 border border-[#F2F2F2] rounded-lg px-4 p-2 shadow-sm bg-white hover:bg-gray-50">
              <Image src="/sort.svg" alt="filter-icon" width={20} height={20} />
              <strong className="text-xs lg:text-base">Filter & Sort</strong>
            </button>
          </div>

          {/* Tabs */}
          <div className="relative w-full max-w-md mx-auto border-b border-[#F2F2F2] mb-10">
            <div className="flex justify-between relative">
              {['recent', 'saved'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as 'recent' | 'saved')}
                    className={`flex-1 text-center py-3 text-lg font-medium transition-colors duration-300 ${
                      isActive ? 'text-black' : 'text-[#4F4F4F]'
                    }`}
                  >
                    {tab === 'recent' ? 'Most Recent' : 'Saved Jobs'}
                  </button>
                );
              })}

              <span
                className="absolute bottom-0 h-[3px] w-1/2 bg-black rounded-full transition-transform duration-500 ease-in-out"
                style={{
                  transform: activeTab === 'recent' ? 'translateX(0%)' : 'translateX(100%)',
                }}
              />
            </div>
          </div>

          {/* Job Cards */}
          <div className="mt-8">
            {activeTab === 'saved' ? (
              savedJobIds.length === 0 ? (
                <p className="text-center text-[#4F4F4F] text-sm lg:text-base">
                  No saved jobs yet.
                </p>
              ) : (
                <JobCard filterSavedOnly showUnsaveButton limit={limit} />
              )
            ) : (
              <JobCard limit={limit} />
            )}

            {/* Load More button */}
            {activeTab === 'recent' && hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
          <ScrollToTopButton />
        </div>
      </div>
    </div>
  );
}
