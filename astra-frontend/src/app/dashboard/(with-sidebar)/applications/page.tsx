// applications main page (updated)
"use client";
import { useState, useEffect } from "react";
import JobApplications from "../../../components/JobApplications";
import api from "@/utils/api.class"; // Adjust path as needed
import Loader from "@/app/components/common/Loader";

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

export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalJobs: 0,
    totalApplications: 0,
    highestPrice: 0,
    openJobs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.getAllApplications();
        if (!response.status || !Array.isArray(response.data)) {
          throw new Error("Invalid API response");
        }
        const applications = response.data;
        console.log("Fetched applications:", JSON.stringify(applications));

        const jobMap = new Map<string, Job>();

        applications.forEach((app: any) => {
          const jobId = app.jobId;
          if (!jobMap.has(jobId)) {
            jobMap.set(jobId, {
              jobId,
              title: app.jobTitle,
              applicationsCount: 0,
              applicants: [],
              image: "",
              price: `${app.jobBudget}`,
            });
          }
          const job = jobMap.get(jobId)!;
          job.applicationsCount++;
          job.applicants.push({
            applicationId: app.id,
            makerId: app.maker.id,
            name: app.maker.fullName,
            email: app.maker.email,
            profileImage: app.maker.profilePicture || "",
            yearsOfExperience: 0, // Fetch from profile if needed
            skills: app.maker.skills || [],
            proposedAmount: app.proposedBudget,
            minimumNegotiableAmount: app.proposedBudget,
            timeline: `${Math.ceil(app.proposedTimeline / 7)} weeks`,
            portfolioLinks: app.portfolioUrl ? [app.portfolioUrl] : [],
            selectedProjects: app.selectedProjects.map((p: any) => {
              if (typeof p === "string") {
                return {
                  id: p,
                  title: "",
                  thumbnail: "",
                  link: "",
                };
              }
              return {
                id: p.id,
                title: p.title,
                thumbnail: p.images?.[0] || "",
                link: "",
              };
            }),
          });
        });

        const jobs = Array.from(jobMap.values());
        const totalJobs = jobs.length;
        const totalApplications = applications.length;
        const highestPrice =
          jobs.length > 0
            ? Math.max(...jobs.map((j) => parseFloat(j.price.slice(1)) || 0))
            : 0;
        const openJobs = jobs.length;

        setJobs(jobs);
        setAnalytics({ totalJobs, totalApplications, highestPrice, openJobs });
      } catch (err) {
        setError(
          "Failed to fetch applications: " +
            (err instanceof Error ? err.message : String(err))
        );
        console.error("Error details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading)
    return (
      <div className='mt-10'>
        <Loader />
      </div>
    );
  if (error) return <div className='p-10 text-gray-400'>{error}</div>;

  return (
    <div>
      <div className='p-8'>
        <JobApplications jobs={jobs} analytics={analytics} />
      </div>
    </div>
  );
}
