"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, ExternalLink, Clock, DollarSign } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatWithMakerButton from "./ChatWithMakerButton";
import api, { MakerProfileResponse } from "@/utils/api.class";

interface MakerDetail {
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
  selectedProjects: {
    id: string;
    title: string;
    thumbnail: string;
    link: string;
  }[];
}

interface MakerDetailModalProps {
  maker: MakerDetail;
  trigger: React.ReactNode;
}

export default function MakerDetailModal({
  maker: initialMaker,
  trigger,
}: MakerDetailModalProps) {
  const [open, setOpen] = useState(false);
  const [fullMaker, setFullMaker] = useState<MakerProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (open && !fullMaker) {
      setLoading(true);
      api
        .getMakerProfile(initialMaker.applicationId)
        .then((response) => {
          console.log("getMakerProfile raw response:", response); // Debug raw response
          // Assume response is { data: { maker: ... }, status: true, message: "Success" }
          const data = response.data; // Access inner data field
          if (!data?.maker) {
            throw new Error("Invalid maker profile data: maker object missing");
          }
          setFullMaker(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch maker profile:", error);
          setError(
            "Failed to load maker profile: " +
              (error instanceof Error ? error.message : String(error))
          );
          setLoading(false);
        });
    }
  }, [open, fullMaker, initialMaker.applicationId]);

  const parsePortfolioLinks = (links: string[]): string[] => {
    try {
      return links
        .flatMap((link) => {
          if (typeof link === "string" && link.startsWith('["')) {
            return JSON.parse(link) as string[];
          }
          return link;
        })
        .filter((link) => typeof link === "string" && link.startsWith("http"));
    } catch (err) {
      console.error("Failed to parse portfolioLinks:", err);
      return [];
    }
  };

  const displayedMaker = fullMaker?.maker
    ? {
        name: fullMaker.maker.fullName || "Unknown Maker",
        email: fullMaker.maker.email || "",
        profileImage: fullMaker.maker.profilePicture || "/makers/default.png",
        yearsOfExperience: fullMaker.maker.yearsOfExperience || 0,
        skills: fullMaker.maker.skills || [],
        proposedAmount:
          fullMaker.application.proposedAmount || initialMaker.proposedAmount,
        timeline: fullMaker.application.proposedTimeline
          ? `${Math.ceil(fullMaker.application.proposedTimeline / 7)} weeks`
          : initialMaker.timeline,
        portfolioLinks: parsePortfolioLinks(
          fullMaker.application.portfolioLinks || []
        ),
        selectedProjects: (fullMaker.application.selectedProjects || []).map(
          (p: any) => {
            if (typeof p === "string") {
              return {
                id: p,
                title: "",
                thumbnail: "",
                link: "",
              };
            }
            return {
              id: p.id || "",
              title: p.title || "",
              thumbnail: p.images?.[0] || "",
              link: p.link || "",
            };
          }
        ),
      }
    : {
        ...initialMaker,
        profileImage: initialMaker.profileImage || "/makers/default.png",
        skills: initialMaker.skills || [],
        portfolioLinks: parsePortfolioLinks(initialMaker.portfolioLinks || []),
        selectedProjects: (initialMaker.selectedProjects || []).map((p) => ({
          id: p.id || "",
          title: p.title || "",
          thumbnail: p.thumbnail || "",
          link: p.link || "",
        })),
      };

  const handleDecline = async () => {
    try {
      await api.declineApplication(initialMaker.applicationId);
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error("Failed to decline application:", error);
      setError("Failed to decline application");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Maker Profile
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className='flex justify-center items-center h-40'>
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className='flex justify-center items-center h-40 text-red-600'>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Profile Info */}
            <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
              <Image
                src={displayedMaker.profileImage}
                alt={displayedMaker.name}
                width={100}
                height={100}
                className='rounded-full object-cover w-24 h-24'
              />
              <div className='space-y-2 text-center sm:text-left'>
                <h2 className='text-lg font-medium'>{displayedMaker.name}</h2>
                <p className='flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600'>
                  <Mail size={16} />
                  <a
                    href={`mailto:${displayedMaker.email}`}
                    className='text-blue-600 hover:underline'>
                    {displayedMaker.email || "No email provided"}
                  </a>
                </p>
                <p className='text-sm text-gray-600'>
                  {displayedMaker.yearsOfExperience} years experience
                </p>
                <div className='flex flex-wrap gap-2'>
                  {displayedMaker.skills.length > 0 ? (
                    displayedMaker.skills.map((skill) => (
                      <Badge key={skill} variant='secondary'>
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant='secondary'>No skills listed</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Job-specific Info */}
            <div className='mt-4 space-y-2'>
              <p className='flex items-center gap-2 text-gray-700'>
                <DollarSign size={16} className='text-green-600' />
                Proposed Amount:{" "}
                <span className='font-medium'>
                  ${displayedMaker.proposedAmount}
                </span>
              </p>
              <p className='flex items-center gap-2 text-gray-700'>
                <Clock size={16} className='text-pink-600' />
                Timeline:{" "}
                <span className='font-medium'>{displayedMaker.timeline}</span>
              </p>
            </div>

            {/* Portfolio Links */}
            <div className='mt-4'>
              <h3 className='font-medium text-gray-900 mb-2'>Portfolio</h3>
              {displayedMaker.portfolioLinks.length > 0 ? (
                <ul className='list-disc pl-5 space-y-1 text-sm'>
                  {displayedMaker.portfolioLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-1 text-blue-600 hover:underline'>
                        {link} <ExternalLink size={14} />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-sm text-gray-600'>
                  No portfolio links provided
                </p>
              )}
            </div>

            {/* Selected Projects */}
            {displayedMaker.selectedProjects?.length > 0 ? (
              <div className='mt-6'>
                <h3 className='font-medium text-gray-900 mb-3'>
                  Selected Projects
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {displayedMaker.selectedProjects.map((project) => (
                    <a
                      key={project.id}
                      href={project.link || "#"}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='rounded-lg border p-2 hover:shadow-md transition'>
                      <Image
                        src={project.thumbnail || "/default-thumbnail.png"}
                        alt={project.title || "Project"}
                        width={400}
                        height={250}
                        className='rounded-md object-cover w-full h-32'
                      />
                      <p className='mt-2 text-sm font-medium'>
                        {project.title || "Untitled Project"}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className='mt-6'>
                <h3 className='font-medium text-gray-900 mb-3'>
                  Selected Projects
                </h3>
                <p className='text-sm text-gray-600'>No projects selected</p>
              </div>
            )}

            {/* Actions */}
            <div className='mt-6 flex justify-end gap-2'>
              <button
                onClick={handleDecline}
                className='px-3 py-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-sm hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 transition'>
                Decline
              </button>
              <ChatWithMakerButton makerId={initialMaker.makerId} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
