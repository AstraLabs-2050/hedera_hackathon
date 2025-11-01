"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import CreatorSidebar from "../../components/creatorSidebar";
import CreatorNavbar from "../../components/creatorNavbar";
import Image from "next/image";
import EarningStatCards from "@/app/components/EarningStatCards";
import RecentActivitiesTable from "../../components/RecentActivitiesTable";
import EarningStatCardsSkeleton from "@/app/components/EarningStatCardsSkeleton";
import RecentActivitiesTableSkeleton from "@/app/components/RecentActivitiesTableSkeleton";
import { fetcherWithToken } from "../../hooks/useEarnings";

export default function Page() {
    const [token, setToken] = useState<string | null>(null);
    const [tokenLoaded, setTokenLoaded] = useState(false);

    // Read token from localStorage only once, on client
    useEffect(() => {
        const storedToken = localStorage.getItem("jwt_token");
        setToken(storedToken);
        setTokenLoaded(true); // now we know token is read
    }, []);

    // Only fetch earnings if token exists
    const { data, error, isLoading } = useSWR(
        token ? [`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/maker/earnings`, token] : null,
        fetcherWithToken,
        { revalidateOnFocus: true, dedupingInterval: 60000 }
    );

    // Prepare stats and recent activities
    const stats = data?.data
        ? [
            {
                title: "Total Earnings",
                amount: `$${data.data.totalEarnings.toLocaleString()}`,
                icon: "/dollar-earn.svg",
                trend: "", // you can add trend logic here
                trendIcon: null,
                date: "",
            },
            {
                title: "Pending Earnings",
                amount: `$${data.data.pendingEarnings.toLocaleString()}`,
                icon: "/dollar-earn.svg",
                trend: null,
                trendIcon: null,
                date: "",
            },
            {
                title: "Available Earnings",
                amount: `$${data.data.availableEarnings.toLocaleString()}`,
                icon: "/available-icon.svg",
                trend: null,
                trendIcon: null,
                date: "",
            },
            {
                title: "Total Jobs Completed",
                amount: data.data.totalJobsCompleted,
                icon: "/total.svg",
                trend: null,
                trendIcon: null,
                date: "",
            },
        ]
        : [];

    const recentActivities = data?.data?.recentActivities
        ? data.data.recentActivities.map((activity) => ({
            timestamp: new Date(activity.timestamp).toLocaleDateString(),
            description: activity.description,
            brand: activity.brandName,
            status: activity.status,
            amount: activity.amount,
            paymentStatus: activity.paymentStatus,
        }))
        : [];

    // Render **nothing** until token is loaded
    if (!tokenLoaded) return null;

    return (
        <div className="flex flex-col min-h-screen font-[ClashGrotesk-regular] pb-20">
            <CreatorNavbar />

            <div className="flex flex-1 flex-col lg:flex-row">
                <div className="shrink-0">
                    <CreatorSidebar />
                </div>

                <div className="flex-1 flex flex-col pt-6 xl:pt-10 px-4 sm:px-6 lg:px-12 overflow-x-hidden">
                    <h2 className="flex items-center gap-2 text-lg sm:text-xl lg:text-3xl font-semibold">
                        Your Earnings
                        <Image src="/Money Bag.svg" width={24} height={24} alt="Money bag" />
                    </h2>
                    <p className="text-sm lg:text-xl text-[#4F4F4F] w-full lg:w-full mt-1">
                        Here you can view your earnings.
                    </p>

                    {/* Show skeleton while loading */}
                    {isLoading && (
                        <>
                            <div className="mt-6">
                                <EarningStatCardsSkeleton />
                            </div>
                            <div className="mt-8">
                                <RecentActivitiesTableSkeleton />
                            </div>
                        </>
                    )}

                    {/* Show error */}
                    {error && <p className="mt-6 text-center text-red-500">Failed to load earnings: {error.message}</p>}

                    {/* Show actual earnings */}
                    {!isLoading && !error && data && (
                        <>
                            <div className="mt-6">
                                <EarningStatCards stats={stats} />
                            </div>
                            <div className="mt-8">
                                <RecentActivitiesTable activities={recentActivities} />
                            </div>
                        </>
                    )}

                    {/* No token */}
                    {tokenLoaded && !token && (
                        <p className="mt-6 text-center text-red-500">You are not logged in.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
