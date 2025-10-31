// mockData.js (or mockData.ts if using TypeScript)
import type { Stat, RecentActivity } from "../../types/types";

export const stats: Stat[] = [
  {
    title: "Total Earnings",
    amount: "$432,215.32",
    date: "May 17, 2022",
    trend: "+2.4%",
    trendIcon: '/trending-up.svg',
    icon: '/dollar-earn.svg'
  },
  {
    title: "Pending",
    amount: "$4,215.32",
    date: "May 17, 2022",
    icon: '/dollar-earn.svg'
  },
  {
    title: "Available",
    amount: "$2,215.32",
    date: "May 17, 2022",
    icon: '/available-icon.svg'
  },
  {
    title: "Total Jobs Completed",
    amount: "10",
    date: "May 17, 2022",
    icon: '/total.svg'
  }
];

export const recentActivities = [
  {
    timestamp: "May 17, 2022 10:00",
    description: "Turn Fashion Images to 3D",
    brand: "Al Fashion",
    status: "Pending",
    amount: 120,
    paymentStatus: "-",
    invoiceLink: "#"
  },
  {
    timestamp: "May 17, 2022 10:00",
    description: "Turn Fashion Images to 3D",
    brand: "BEZZZ",
    status: "Completed",
    amount: 400,
    paymentStatus: "Paid",
    invoiceLink: "#"
  },
  {
    timestamp: "May 17, 2022 10:00",
    description: "Turn Fashion Images to 3D",
    brand: "ZARA",
    status: "Pending",
    amount: 100,
    paymentStatus: "-",
    invoiceLink: "#"
  },
  {
    timestamp: "May 17, 2022 10:00",
    description: "Turn Fashion Images to 3D",
    brand: "Nike",
    status: "Completed",
    amount: 1000,
    paymentStatus: "Paid",
    invoiceLink: "#"
  },
  {
    timestamp: "May 17, 2022 10:00",
    description: "Turn Fashion Images to 3D",
    brand: "Addidas",
    status: "Pending",
    amount: 210,
    paymentStatus: "-",
    invoiceLink: "#"
  },
  {
    timestamp: "May 17, 2022 10:00",
    description: "Turn Fashion Images to 3D",
    brand: "Bolu stitches",
    status: "Completed",
    amount: 75,
    paymentStatus: "Paid",
    invoiceLink: "#"
  },
  {
    timestamp: "May 17, 2022 10:00",
    description: "Turn Fashion Images to 3D",
    brand: "Al Fashion",
    status: "Pending",
    amount: 245,
    paymentStatus: "-",
    invoiceLink: "#"
  },
  {
    timestamp: "May 17, 2022 10:00",
    description: "Turn Fashion Images to 3D",
    brand: "All Mish",
    status: "Completed",
    amount: 875,
    paymentStatus: "Paid",
    invoiceLink: "#"
  }
];
