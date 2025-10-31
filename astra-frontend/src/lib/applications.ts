// lib/applications.ts (remove server-side fetch)
export interface Maker {
  applicationId: string;
  makerId: string;
  name: string;
  email: string;
  profileImage: string;
  yearsOfExperience: number;
  skills: string[];
  proposedAmount: number;
  minimumNegotiableAmount: number;
  timeline: string;
  portfolioLinks: string[];
  selectedProjects?: SelectedProject[];
}

export interface Job {
  jobId: string;
  title: string;
  applicationsCount: number;
  applicants: Maker[];
  image: string;
  price: string;
}

export interface Analytics {
  totalJobs: number;
  totalApplications: number;
  highestPrice: number;
  openJobs: number;
}

export interface SelectedProject {
  id: string;
  title: string;
  thumbnail: string;
  link: string;
}

// export interface Maker {
//   makerId: string;
//   name: string;
//   email: string;
//   profileImage: string;
//   yearsOfExperience: number;
//   skills: string[];
//   proposedAmount: number;
//   minimumNegotiableAmount: number;
//   timeline: string;
//   portfolioLinks: string[];
//   selectedProjects?: SelectedProject[];
// }

// export interface Job {
//   jobId: string;
//   title: string;
//   applicationsCount: number;
//   applicants: Maker[];
//   image: string;
//   price: string;
// }

// export interface Analytics {
//   totalJobs: number;
//   totalApplications: number;
// }

// export interface SelectedProject {
//   id: string;
//   title: string;
//   thumbnail: string;
//   link: string;
// }

// export async function getApplications(): Promise<{
//   jobs: Job[];
//   analytics: Analytics;
// }> {
//   const res = await fetch("http://localhost:3000/mock/application.json", {
//     cache: "no-store", // fresh each request
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch applications");
//   }

//   const jobs: Job[] = await res.json();

//   // compute analytics
//   const totalJobs = jobs.length;
//   const totalApplications = jobs.reduce(
//     (acc, job) => acc + job.applicationsCount,
//     0
//   );

//   return { jobs, analytics: { totalJobs, totalApplications } };
// }
