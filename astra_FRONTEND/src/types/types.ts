// types.ts
export type WorkExperience = {
    id: string;
    employerName: string;
    jobTitle: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    jobDescription: string;
    isCurrentJob: boolean;
};

export type FormData = {
    // Step 1
    fullName: string;
    email: string;
    password: string; // ✅ Added

    // Step 4/5
    profilePicture: File | null;
    location: string;
    categories: string[];
    skills: string[];

    // Step 6 – Identity Verification
    personalIdFiles: File[] | File | null;
    personalIdName: string;
    personalIdCountry: string;
    personalIdExpiry: string;
    isBusiness: '' | 'yes' | 'no';
    businessCertFile: File | null;
    businessName: string;
    taxRegistrationNumber: string;
    registrationCountry: string;
    businessType: string;

    // Step 7
    workExperiences: WorkExperience[];

    // Step 8
    uploadedWorks: UploadedWork[];
};


export type UploadedWork = {
    id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    imageUrl: string;
    // files: File[];
    previewUrls: string[];
    images?: File[];
};


export interface Job {
    id: string;
    title: string;
    brand: string;
    appliedOn: string;
    dueDate?: string | null; // optional because not all jobs will have one
    status: "my-applications" | "ongoing" | "completed" | "all";
}

// types.ts
export interface Stat {
    title: string;
    amount: string; // kept as string because it includes $ and commas
    date: string;
    trend?: string; // optional since not all stats have it
    trendIcon?: string; // optional, only used for Total Earnings
    icon: string; // path to local icon
}

export interface RecentActivity {
    timestamp: string; // e.g., "May 17, 2022 10:00"
    description: string;
    brand: string;
    status: "Pending" | "Completed"; // only two in your design
    amount: number; // kept as number since it's a currency value
    paymentStatus: "-" | "Paid"; // two options in screenshot
    invoiceLink: string; // could be "#" or a real URL
}
