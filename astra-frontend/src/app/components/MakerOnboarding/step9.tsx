// 'use client';

// import { useState } from 'react';
// import ProgressHeader from '../ProgressHeader';
// import ProfileImageUpload from '../ProfileImageUpload';
// import LocationSelect from '../LocationSelect';
// import Input from '../input';
// import TagInput from '../TagInput';
// import Button from '../button';
// import Image from 'next/image';
// import MakerSidebar from '../MakerSidebar'
// // import { WorkExperience } from '@/types/types';
// import type { UploadedWork, WorkExperience, FormData } from '@/types/types';

// type Step9Props = {
//     formData: FormData;
//     setFormData: React.Dispatch<React.SetStateAction<FormData>>;
//     onNext: () => void;
//     onBack: () => void;
//     // setStep: (step: number) => void;
// };

// const months = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
// ];

// export default function Step9({
//     formData,
//     setFormData,
//     onNext,
//     onBack,
//     // setStep 
// }: Step9Props) {
//     const [isLoading, setIsLoading] = useState(false);
//     const [isEditingMakerType, setIsEditingMakerType] = useState(false);
//     const [showSidebar, setShowSidebar] = useState(false);
//     const [currentExperience, setCurrentExperience] = useState<WorkExperience>({
//         id: '',
//         employerName: '',
//         jobTitle: '',
//         startMonth: '',
//         startYear: '',
//         endMonth: '',
//         endYear: '',
//         jobDescription: '',
//         isCurrentJob: false
//     });



//     const dummyWorks: UploadedWork[] = [
//         {
//             id: "1",
//             title: "My Artwork One",
//             files: [],
//             imageUrl: "",
//             previewUrls: ["/upload-img1.png"],
//         },
//         {
//             id: "2",
//             title: "Craft Sample Two",
//             files: [],
//             imageUrl: "",
//             previewUrls: ["/upload-img2.png"],
//         },
//     ];

//     const handleEditExperience = (exp: WorkExperience) => {
//         setCurrentExperience(exp);
//         setShowSidebar(true);
//     };

//     const handleSaveExperience = (updated: WorkExperience | null) => {
//         if (!updated) return; // skip if it's null

//         const exists = formData.workExperiences.some((exp) => exp.id === updated.id);

//         const updatedExperiences = exists
//             ? formData.workExperiences.map((exp) =>
//                 exp.id === updated.id ? updated : exp
//             )
//             : [...formData.workExperiences, updated];

//         setFormData((prev) => ({
//             ...prev,
//             workExperiences: updatedExperiences,
//         }));

//         setShowSidebar(false);
//     };





//     return (
//         <div className='max-w-6xl w-full bg-white flex flex-col justify-center items-center'>
//             <ProgressHeader step={9} onBack={onBack} />
//             <div className="w-full max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">

//                 <h1 className="text-3xl sm:text-[28px] md:text-[32px] font-semibold text-center mt-6 mb-8">
//                     Review your details
//                 </h1>

//                 {/* Profile Image */}
//                 <div className="text-center mb-8">
//                     <ProfileImageUpload
//                         profileImage={formData.profileImage}
//                         onChange={(file) => setFormData((prev) => ({ ...prev, profileImage: file }))}
//                     />
//                 </div>

//                 {/* Full Name + Email */}
//                 <div className=" flex flex-col gap-2 space-y-4 mb-6 w-full">
//                     <div className='flex flex-col gap-1'>
//                         <label htmlFor="" className='text-xl'>Full Name</label>
//                         <Input
//                             placeholder="Full Name"
//                             name="fullName"
//                             type="text"
//                             value={formData.fullName}
//                             onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
//                             className='rounded-lg w-full'
//                         />
//                     </div>

//                     <div className='flex flex-col gap-1'>
//                         <label htmlFor="" className='text-xl'>Email address</label>
//                         <Input
//                             placeholder="Email Address"
//                             name="email"
//                             type="email"
//                             value={formData.email}
//                             onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
//                             className="rounded-lg w-full"
//                         // disabled
//                         />
//                     </div>
//                 </div>

//                 {/* Maker Type */}
//                 <div className="mb-6">
//                     <p className="lg:text-xl sm:text-base mb-2">
//                         What will you be joining Astra as?
//                     </p>

//                     <div className="relative">
//                         <Input
//                             placeholder="Type of Maker"
//                             name="makerType"
//                             type="text"
//                             value={formData.makerType || ''}
//                             className="w-full pr-20 rounded-lg bg-white"
//                             disabled
//                         />

//                         <button
//                             type="button"
//                             onClick={() => {
//                                 setFormData((prev) => ({
//                                     ...prev,
//                                     makerType:
//                                         prev.makerType === "Digital Creator"
//                                             ? "Physical Maker"
//                                             : "Digital Creator",
//                                 }));
//                             }}
//                             className="absolute top-1/2 -translate-y-1/2 right-3 text-sm text-[#1D40C8]"
//                         >
//                             Change
//                         </button>
//                     </div>
//                 </div>


//                 {/* Location */}
//                 <div className="mb-6">
//                     <LocationSelect
//                         value={formData.location}
//                         onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
//                     />
//                 </div>

//                 {/* Categories */}
//                 <div className="mb-6 text-left">
//                     <TagInput
//                         label="What category best suits you?"
//                         skills={formData.categories}
//                         setSkills={(updated) => setFormData((prev) => ({ ...prev, categories: updated }))}
//                     />
//                 </div>

//                 {/* Skills */}
//                 <div className="mb-6 text-left">
//                     <TagInput
//                         label="What are your skills?"
//                         skills={formData.skills}
//                         setSkills={(updated) => setFormData((prev) => ({ ...prev, skills: updated }))}
//                     />
//                 </div>

//                 {/* Work Experience */}
//                 <div className="flex flex-col items-center justify-center px-4 w-full mt-8">
//                     <h2 className="w-full text-left text-lg font-bold p-4 uppercase">
//                         Your Work Experience
//                     </h2>

//                     <div className="space-y-4 w-full px-4 mb-4">
//                         {formData.workExperiences.map((exp, index) => (
//                             <div
//                                 key={exp.id}
//                                 className="w-full border border-[#E0E0E0] p-4 rounded-lg text-sm bg-[#F6F6F6]"
//                             >
//                                 <div className="flex justify-between mb-1 w-full">
//                                     <p className="font-semibold">
//                                         {exp.jobTitle} - {exp.employerName}
//                                     </p>
//                                     <div className="flex space-x-2">
//                                         <button
//                                             title="Edit"
//                                             onClick={() => handleEditExperience(exp)}
//                                         >
//                                             <Image
//                                                 src="/experience-edit-icon.svg"
//                                                 alt="Edit"
//                                                 width={20}
//                                                 height={20}
//                                                 className="w-4 h-4"
//                                             />
//                                         </button>
//                                         <button
//                                             onClick={() => {
//                                                 const updated = formData.workExperiences.filter((_, i) => i !== index);
//                                                 setFormData((prev) => ({ ...prev, workExperiences: updated }));
//                                             }}
//                                             title="Delete"
//                                         >
//                                             <Image
//                                                 src="/delete-icon.svg"
//                                                 alt="Delete"
//                                                 width={20}
//                                                 height={20}
//                                                 className="w-4 h-4"
//                                             />
//                                         </button>
//                                     </div>
//                                 </div>
//                                 <p className="text-xs text-gray-600">
//                                     {exp.startMonth} {exp.startYear} –{' '}
//                                     {exp.isCurrentJob ? 'Present' : `${exp.endMonth} ${exp.endYear}`}
//                                 </p>
//                             </div>
//                         ))}
//                     </div>

//                     <div className="w-full px-4">
//                         <button
//                             type="button"
//                             onClick={() => {
//                                 setCurrentExperience({
//                                     id: Date.now().toString(), // temp ID; backend should overwrite
//                                     employerName: '',
//                                     jobTitle: '',
//                                     startMonth: '',
//                                     startYear: '',
//                                     endMonth: '',
//                                     endYear: '',
//                                     jobDescription: '',
//                                     isCurrentJob: false,
//                                 })
//                                 setShowSidebar(true)
//                             }}

//                             className="w-full flex justify-center items-center gap-4 font-[ClashGrotesk-Medium] h-14 rounded-xl p-4 border border-black"
//                         >
//                             <span className="text-base">Add Experience</span>
//                         </button>
//                     </div>
//                 </div>

//                 {/* Uploaded Works */}
//                 <div className="mt-10 mb-16 w-full max-w-[488px] mx-auto ">

//                     <h2 className="text-lg font-bold uppercase mb-1 text-left">
//                         Your Uploaded Works
//                     </h2>
//                     <div className='border border-[#F2F2F2] p-4 rounded-lg my-4'>
//                         <p className="text-lg font-bold mb-6 text-left border-b border-b-[#F2F2F2]">
//                             {formData.uploadedWorks[formData.uploadedWorks.length - 1]?.title || "Untitled Work"}
//                         </p>

//                         <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 mb-2">
//                             {dummyWorks.map((work) =>
//                                 work.previewUrls.map((url, index) => (
//                                     <div key={index} className="overflow-hidden rounded-xl w-full h-48 aspect-auto sm:aspect-square relative">
//                                         <Image
//                                             src={url}
//                                             alt={`Uploaded work ${index + 1}`}
//                                             fill
//                                             className="object-cover"
//                                         />
//                                     </div>
//                                 ))
//                             )}
//                         </div>

//                     </div>

//                     <button
//                         type="button"
//                         className="w-full h-14 border border-gray-300 rounded-xl text-base font-semibold hover:bg-gray-100 transition"
//                     >
//                         Upload more work
//                     </button>
//                 </div>

//                 {/* Save & Complete */}
//                 <Button
//                     label={isLoading ? 'Loading...' : 'Save & Complete'}
//                     className="w-full bg-black text-white py-3 rounded-xl"
//                     disabled={isLoading}
//                     onClick={onNext}
//                 />
//             </div>

//             <MakerSidebar
//                 visible={showSidebar}
//                 onClose={() => setShowSidebar(false)}
//                 currentExperience={currentExperience}
//                 setCurrentExperience={setCurrentExperience}
//                 onSave={handleSaveExperience}
//                 isLoading={false}
//             />
//         </div>
//     );
// }