"use client";

import React, { useState } from "react";
import { Job, Analytics } from "@/lib/applications"; // Type settings for Job object values
import { ChevronDown, Users, Clock, DollarSign } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChatWithMakerButton from "./ChatWithMakerButton"; // Handled the Accept and Chat Buttons
import MakersDetailModal from "./MakersDetailModal";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/utils/api.class"; // Adjust path as needed
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface JobApplicationsProps {
  jobs: Job[];
  analytics: Analytics;
}

export default function JobApplications({
  jobs,
  analytics,
}: JobApplicationsProps) {
  const [openJobId, setOpenJobId] = useState<string | null>(null);
  const router = useRouter();

  const toggleJob = (jobId: string) => {
    setOpenJobId(openJobId === jobId ? null : jobId);
  };

  const handleDecline = async (applicationId: string) => {
    try {
      const response = await api.declineApplication(applicationId);
      console.log("Decline response:", response);
      router.refresh();
    } catch (error) {
      console.error("Failed to decline application:", error);
      // Optionally show toast or error message
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col justify-center items-center py-4 text-center'>
        <h3 className='font-bold text-3xl'>Applications</h3>
        <p className='text-gray-600'>
          View insights on your job postings and applicants
        </p>
      </div>

      {/* Analytics Summary */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <div className='rounded-lg bg-pink-50 p-4 text-center'>
          <p className='text-sm text-gray-500'>Total Jobs</p>
          <p className='text-lg font-semibold'>{analytics.totalJobs}</p>
        </div>
        <div className='rounded-lg bg-blue-50 p-4 text-center'>
          <p className='text-sm text-gray-500'>Total Applications</p>
          <p className='text-lg font-semibold'>{analytics.totalApplications}</p>
        </div>
        <div className='rounded-lg bg-green-50 p-4 text-center'>
          <p className='text-sm text-gray-500'>Highest Price</p>
          <p className='text-lg font-semibold'>${analytics.highestPrice}</p>
        </div>
        <div className='rounded-lg bg-yellow-50 p-4 text-center'>
          <p className='text-sm text-gray-500'>Open Jobs</p>
          <p className='text-lg font-semibold'>{analytics.openJobs}</p>
        </div>
      </div>

      {/* Jobs List */}
      <div className='space-y-4'>
        {jobs.map((job) => (
          <div
            key={job.jobId}
            className='rounded-xl border bg-white shadow-sm overflow-hidden transition hover:shadow-md'>
            {/* Job Header */}
            <button
              onClick={() => toggleJob(job.jobId)}
              className='w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 text-left'>
              <div className='flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6'>
                <Image
                  src={job.image}
                  alt='Job Image'
                  width={60}
                  height={60}
                  className='rounded-md object-cover'
                />
                <div>
                  <h3 className='text-base sm:text-lg font-medium text-gray-900'>
                    {job.title}
                  </h3>
                  <div className='flex flex-wrap gap-2 text-sm text-gray-600 mt-1'>
                    <span className='inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md'>
                      <Users size={14} /> {job.applicationsCount}
                    </span>
                    <span className='inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md'>
                      <DollarSign size={14} /> {job.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rotating Chevron */}
              <motion.span
                className='self-end sm:self-center text-gray-500'
                animate={{ rotate: openJobId === job.jobId ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}>
                <ChevronDown />
              </motion.span>
            </button>

            {/* Makers List with Animation */}
            <AnimatePresence initial={false}>
              {openJobId === job.jobId && (
                <motion.ul
                  className='divide-y border-t'
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}>
                  {job.applicants.length > 0 ? (
                    job.applicants.map((maker) => (
                      <li
                        key={maker.makerId}
                        className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700'>
                            {maker.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className='font-medium'>{maker.name}</p>
                            <p className='text-sm text-gray-600 flex items-center gap-1'>
                              <DollarSign size={14} /> {maker.proposedAmount} •{" "}
                              <Clock size={14} /> {maker.timeline}
                            </p>
                          </div>
                        </div>
                        <div className='flex flex-wrap sm:flex-nowrap gap-2'>
                          <MakersDetailModal
                            maker={{
                              applicationId: maker.applicationId,
                              makerId: maker.makerId,
                              name: maker.name,
                              email: maker.email || "",
                              profileImage:
                                maker.profileImage || "/makers/default.png",
                              yearsOfExperience: maker.yearsOfExperience || 1,
                              skills: maker.skills || ["No skills listed"],
                              proposedAmount: maker.proposedAmount,
                              minimumNegotiableAmount:
                                maker.minimumNegotiableAmount,
                              timeline: maker.timeline,
                              portfolioLinks: maker.portfolioLinks,
                              selectedProjects: maker.selectedProjects || [],
                            }}
                            trigger={
                              <button className='px-3 py-1 bg-[#E0E0E0] text-black rounded hover:opacity-90'>
                                View Details
                              </button>
                            }
                          />
                          <ChatWithMakerButton makerId={maker.makerId} />{" "}
                          {/* Update to use applicationId if needed for accept */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className='px-3 py-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-sm hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 transition'>
                                Decline
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Are you absolutely sure?
                                </DialogTitle>
                                <DialogDescription>
                                  This action cannot be undone. This will
                                  permanently decline the makers application
                                </DialogDescription>
                              </DialogHeader>

                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant='outline'>Cancel</Button>
                                </DialogClose>
                                <Button
                                  onClick={() =>
                                    handleDecline(maker.applicationId)
                                  }
                                  type='submit'
                                  variant='destructive'>
                                  Decline
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className='p-4 text-gray-500 text-sm text-center'>
                      No applications yet
                    </li>
                  )}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// "use client";

// import React, { useState } from "react";
// import { Job } from "@/lib/applications"; // Type settings for Job object values
// import { ChevronDown, Users, Clock, DollarSign } from "lucide-react";
// import Image from "next/image";
// import ChatWithMakerButton from "./ChatWithMakerButton"; // Handled the Accept and Chat Buttons
// import MakersDetailModal from "./MakersDetailModal";
// import { motion, AnimatePresence } from "framer-motion";

// interface JobApplicationsProps {
//   jobs: Job[];
// }

// export default function JobApplications({ jobs }: JobApplicationsProps) {
//   const [openJobId, setOpenJobId] = useState<string | null>(null);

//   const toggleJob = (jobId: string) => {
//     setOpenJobId(openJobId === jobId ? null : jobId);
//   };

//   return (
//     <div className='space-y-6'>
//       {/* Header */}
//       <div className='flex flex-col justify-center items-center py-4 text-center'>
//         <h3 className='font-bold text-3xl'>Applications</h3>
//         <p className='text-gray-600'>
//           View insights on your job postings and applicants
//         </p>
//       </div>

//       {/* Analytics Summary */}
//       <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
//         <div className='rounded-lg bg-pink-50 p-4 text-center'>
//           <p className='text-sm text-gray-500'>Total Jobs</p>
//           <p className='text-lg font-semibold'>{jobs.length}</p>
//         </div>
//         <div className='rounded-lg bg-blue-50 p-4 text-center'>
//           <p className='text-sm text-gray-500'>Total Applications</p>
//           <p className='text-lg font-semibold'>
//             {jobs.reduce((sum, job) => sum + job.applicationsCount, 0)}
//           </p>
//         </div>
//         <div className='rounded-lg bg-green-50 p-4 text-center'>
//           <p className='text-sm text-gray-500'>Highest Price</p>
//           <p className='text-lg font-semibold'>
//             ${Math.max(...jobs.map((j) => Number(j.price) || 0))}
//           </p>
//         </div>
//         <div className='rounded-lg bg-yellow-50 p-4 text-center'>
//           <p className='text-sm text-gray-500'>Open Jobs</p>
//           <p className='text-lg font-semibold'>
//             {jobs.filter((j) => j.applicants && j.applicants.length > 0).length}
//           </p>
//         </div>
//       </div>

//       {/* Jobs List */}
//       <div className='space-y-4'>
//         {jobs.map((job) => (
//           <div
//             key={job.jobId}
//             className='rounded-xl border bg-white shadow-sm overflow-hidden transition hover:shadow-md'>
//             {/* Job Header */}
//             <button
//               onClick={() => toggleJob(job.jobId)}
//               className='w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 text-left'>
//               <div className='flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6'>
//                 <Image
//                   src={job.image}
//                   alt='Job Image'
//                   width={60}
//                   height={60}
//                   className='rounded-md object-cover'
//                 />
//                 <div>
//                   <h3 className='text-base sm:text-lg font-medium text-gray-900'>
//                     {job.title}
//                   </h3>
//                   <div className='flex flex-wrap gap-2 text-sm text-gray-600 mt-1'>
//                     <span className='inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md'>
//                       <Users size={14} /> {job.applicationsCount}
//                     </span>
//                     <span className='inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md'>
//                       <DollarSign size={14} /> ${job.price}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Rotating Chevron */}
//               <motion.span
//                 className='self-end sm:self-center text-gray-500'
//                 animate={{ rotate: openJobId === job.jobId ? 180 : 0 }}
//                 transition={{ duration: 0.3, ease: "easeInOut" }}>
//                 <ChevronDown />
//               </motion.span>
//             </button>

//             {/* Makers List with Animation */}
//             <AnimatePresence initial={false}>
//               {openJobId === job.jobId && (
//                 <motion.ul
//                   className='divide-y border-t'
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   transition={{ duration: 0.3, ease: "easeInOut" }}>
//                   {job.applicants.length > 0 ? (
//                     job.applicants.map((maker) => (
//                       <li
//                         key={maker.makerId}
//                         className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4'>
//                         <div className='flex items-center gap-3'>
//                           <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700'>
//                             {maker.name.charAt(0).toUpperCase()}
//                           </div>
//                           <div>
//                             <p className='font-medium'>{maker.name}</p>
//                             <p className='text-sm text-gray-600 flex items-center gap-1'>
//                               <DollarSign size={14} /> {maker.proposedAmount} •{" "}
//                               <Clock size={14} /> {maker.timeline}
//                             </p>
//                           </div>
//                         </div>
//                         <div className='flex flex-wrap sm:flex-nowrap gap-2'>
//                           <MakersDetailModal
//                             maker={{
//                               makerId: maker.makerId,
//                               name: maker.name,
//                               email: maker.email || "",
//                               profileImage:
//                                 maker.profileImage || "/makers/default.png",
//                               yearsOfExperience: maker.yearsOfExperience || 1,
//                               skills: maker.skills || ["No skills listed"],
//                               proposedAmount: maker.proposedAmount,
//                               minimumNegotiableAmount:
//                                 maker.minimumNegotiableAmount,
//                               timeline: maker.timeline,
//                               portfolioLinks: maker.portfolioLinks,
//                               selectedProjects: maker.selectedProjects || [],
//                             }}
//                             trigger={
//                               <button className='px-3 py-1 bg-[#E0E0E0] text-black rounded hover:opacity-90'>
//                                 View Details
//                               </button>
//                             }
//                           />
//                           <ChatWithMakerButton makerId='6ff62179-9e80-4939-a33f-9e265a044e58' />
//                           {/* <ChatWithMakerButton
//                                                         makerId={maker?.makerId || "6ff62179-9e80-4939-a33f-9e265a044e58"}
//                                                     /> */}
//                           <button
//                             className='px-3 py-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600
//              text-white font-medium shadow-sm hover:from-red-600 hover:to-red-700
//              focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 transition'>
//                             Decline
//                           </button>
//                         </div>
//                       </li>
//                     ))
//                   ) : (
//                     <li className='p-4 text-gray-500 text-sm text-center'>
//                       No applications yet 🚀
//                     </li>
//                   )}
//                 </motion.ul>
//               )}
//             </AnimatePresence>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
