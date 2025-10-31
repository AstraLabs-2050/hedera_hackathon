export type JobCategory =
    | "my-applications"
    | "ongoing"
    | "completed"
    | "all";

export type JobStatus =
    | "awaiting decision"
    | "withdrawn"
    | "not selected by creator"
    | "selected by creator"
    | "due on"
    | "completed";

export interface Job {
    id: string;
    title: string;
    brand: string;
    brandName: string;
    dateTimeApplied: string;
    appliedOn: string;
    dueDate?: string | null;
    category: JobCategory;
    status: JobStatus;
    image: string;
    name: string;
    pay: string;
    stock: number;
    link: string;
    lastUpdated: string;
}
