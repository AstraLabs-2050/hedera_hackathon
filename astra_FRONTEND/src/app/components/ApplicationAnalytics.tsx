"use client";

import React from "react";
import { Analytics } from "@/lib/applications";

interface AnalyticsCardsProps {
    analytics: Analytics;
}

export default function AnalyticsCards({ analytics }: AnalyticsCardsProps) {
    const cards = [
        {
            title: "Total Jobs Posted",
            value: analytics.totalJobs,
        },
        {
            title: "Total Applications",
            value: analytics.totalApplications,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className="rounded-xl border bg-white p-6 shadow-sm max-w-sm">
                    <h2 className="text-sm font-medium text-gray-500">{card.title}</h2>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
            ))}
        </div>
    );
}
