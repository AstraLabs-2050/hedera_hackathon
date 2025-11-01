'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import type { UploadedWork } from '@/types/types';

type ProjectUploadSidebarProps = {
    visible: boolean;
    onClose: () => void;
    onSave: (work: UploadedWork) => void;
};

export default function ProjectUploadSidebar({
    visible,
    onClose,
    onSave
}: ProjectUploadSidebarProps) {
    const [currentWork, setCurrentWork] = useState<Partial<UploadedWork>>({
        title: '',
        description: '',
        tags: [],
        images: [],
        previewUrls: []
    });
    const [showTitleError, setShowTitleError] = useState(false);

    // Reset form every time the sidebar opens
    useEffect(() => {
        if (visible) {
            setCurrentWork({
                title: '',
                description: '',
                tags: [],
                images: [],
                previewUrls: []
            });
            setShowTitleError(false);
        }
    }, [visible]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        // Limit total images to max 4
        const totalImages = (currentWork.images?.length || 0) + files.length;
        if (totalImages > 4) {
            alert('You can upload a maximum of 4 images per project.');
            return;
        }

        if (files.length > 0) {
            const newImages = [...(currentWork.images || []), ...files];
            const newPreviewUrls = [
                ...(currentWork.previewUrls || []),
                ...files.map(file => URL.createObjectURL(file))
            ];
            setCurrentWork({
                ...currentWork,
                images: newImages,
                previewUrls: newPreviewUrls
            });
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentWork({ ...currentWork, title: e.target.value });
        if (showTitleError) {
            setShowTitleError(false);
        }
    };

    const handleAddTag = (tag: string) => {
        if (tag.trim() && !currentWork.tags?.includes(tag.trim())) {
            setCurrentWork({
                ...currentWork,
                tags: [...(currentWork.tags || []), tag.trim()]
            });
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setCurrentWork({
            ...currentWork,
            tags: currentWork.tags?.filter(tag => tag !== tagToRemove) || []
        });
    };

    const handleUploadWork = () => {
        if (!currentWork.title?.trim()) {
            setShowTitleError(true);
            return;
        }
        if (currentWork.images && currentWork.images.length > 0) {
            const newWork: UploadedWork = {
                id: Date.now().toString(),
                title: currentWork.title || '',
                description: currentWork.description || '',
                category: currentWork.category || '',
                tags: currentWork.tags || [],
                imageUrl: currentWork.previewUrls?.[0] || '',
                images: currentWork.images || [],
                previewUrls: currentWork.previewUrls || []
            };
            onSave(newWork);
            onClose();
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-in-out ${
                    visible ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Chevron Close Button */}
            <div
                className={`fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-in-out hidden sm:block ${
                    visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                } right-[calc(35.8%+12px)] lg:right-[calc(35.8%+12px)] md:right-[calc(60%+12px)] sm:right-[calc(80%+12px)]`}
            >
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full shadow-md border bg-white border-gray-300 hover:bg-gray-100 transition-colors"
                >
                    <ChevronRight
                        className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                            visible ? 'rotate-0' : 'rotate-180'
                        }`}
                    />
                </button>
            </div>

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full bg-white shadow-lg z-50 p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
                    visible ? 'translate-x-0' : 'translate-x-full'
                } w-full sm:w-[80%] md:w-[60%] lg:w-[35.8%]`}
            >
                <div className="flex items-center justify-between mb-6">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
                        <Image src="/sidebar-close-icon.svg" alt="Close" width={20} height={20} />
                    </button>
                    <h3 className="text-2xl font-semibold flex-1 text-center">Upload your work</h3>
                    <div className="w-9" />
                </div>

                {/* Title */}
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-4 text-left">Project Title</label>
                    <input
                        type="text"
                        value={currentWork.title || ''}
                        onChange={handleTitleChange}
                        placeholder="What is the title of your project?"
                        className={`w-full px-4 py-2 border ${
                            showTitleError ? 'border-red-500' : 'border-[#4F4F4F]'
                        } rounded-3xl focus:outline-none focus:ring-2 ${
                            showTitleError ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                        }`}
                    />
                    {showTitleError && (
                        <p className="text-red-500 text-sm mt-1">
                            Please enter a project title before uploading
                        </p>
                    )}
                </div>

                {/* Images */}
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-4 text-left">
                        Upload project images (max 4)
                    </label>
                    <div className="border-2 border-dashed bg-[#F8F8F8] border-[#BDBDBD] p-6 text-center">
                        <Image
                            src="/upload-icon.svg"
                            alt="upload-logo"
                            width={20}
                            height={20}
                            className="w-8 h-8 mx-auto mb-2"
                        />
                        <p className="text-sm text-gray-600">Drag and drop here</p>
                        <p className="text-sm text-gray-600">Or</p>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer underline text-sm">
                            Upload from Device
                        </label>
                    </div>
                    {currentWork.previewUrls?.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {currentWork.previewUrls.slice(0, 4).map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-16 object-cover rounded-lg"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-4 text-left">Project Description</label>
                    <textarea
                        value={currentWork.description || ''}
                        onChange={(e) =>
                            setCurrentWork({ ...currentWork, description: e.target.value })
                        }
                        placeholder="Write a short description about the work"
                        rows={3}
                        className="w-full px-4 py-2 border border-[#4F4F4F] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Tags */}
                <div className="mb-6">
                    <label className="block text-sm font-bold mb-4 text-left">Project Tag</label>
                    <div className="flex flex-wrap gap-2 border border-[#4F4F4F] px-3 py-2 rounded-md min-h-[3rem]">
                        {currentWork.tags?.map((tag, index) => (
                            <span
                                key={index}
                                className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                            >
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)}>×</button>
                            </span>
                        ))}
                        <input
                            type="text"
                            placeholder="Type a tag and press Enter"
                            className="flex-grow text-sm px-2 py-1 focus:outline-none min-w-[120px]"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Upload button */}
                <button
                    onClick={handleUploadWork}
                    disabled={!currentWork.title?.trim() || !currentWork.images?.length}
                    className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Upload
                </button>
            </div>
        </>
    );
}



























// 'use client';

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { ChevronRight } from 'lucide-react';
// import type { UploadedWork } from '@/types/types';

// type ProjectUploadSidebarProps = {
//     visible: boolean;
//     onClose: () => void;
//     onSave: (work: UploadedWork) => void;
// };

// export default function ProjectUploadSidebar({
//     visible,
//     onClose,
//     onSave
// }: ProjectUploadSidebarProps) {
//     const [currentWork, setCurrentWork] = useState<Partial<UploadedWork>>({
//         title: '',
//         description: '',
//         tags: [],
//         images: [],
//         previewUrls: []
//     });
//     const [showTitleError, setShowTitleError] = useState(false);

//     // ✅ Reset form every time the sidebar opens
//     useEffect(() => {
//         if (visible) {
//             setCurrentWork({
//                 title: '',
//                 description: '',
//                 tags: [],
//                 images: [],
//                 previewUrls: []
//             });
//             setShowTitleError(false);
//         }
//     }, [visible]);

//     const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const files = Array.from(event.target.files || []);
//         if (files.length > 0) {
//             const newImages = [...(currentWork.images || []), ...files];
//             const newPreviewUrls = [
//                 ...(currentWork.previewUrls || []),
//                 ...files.map(file => URL.createObjectURL(file))
//             ];
//             setCurrentWork({
//                 ...currentWork,
//                 images: newImages,
//                 previewUrls: newPreviewUrls
//             });
//         }
//     };

//     const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setCurrentWork({ ...currentWork, title: e.target.value });
//         if (showTitleError) {
//             setShowTitleError(false);
//         }
//     };

//     const handleAddTag = (tag: string) => {
//         if (tag.trim() && !currentWork.tags?.includes(tag.trim())) {
//             setCurrentWork({
//                 ...currentWork,
//                 tags: [...(currentWork.tags || []), tag.trim()]
//             });
//         }
//     };

//     const handleRemoveTag = (tagToRemove: string) => {
//         setCurrentWork({
//             ...currentWork,
//             tags: currentWork.tags?.filter(tag => tag !== tagToRemove) || []
//         });
//     };

//     const handleUploadWork = () => {
//         if (!currentWork.title?.trim()) {
//             setShowTitleError(true);
//             return;
//         }
//         if (currentWork.images && currentWork.images.length > 0) {
//             const newWork: UploadedWork = {
//                 id: Date.now().toString(),
//                 title: currentWork.title || '',
//                 description: currentWork.description || '',
//                 category: currentWork.category || '',
//                 tags: currentWork.tags || [],
//                 imageUrl: currentWork.previewUrls?.[0] || '',
//                 images: currentWork.images || [],
//                 previewUrls: currentWork.previewUrls || []
//             };
//             onSave(newWork);
//             onClose();
//         }
//     };

//     return (
//         <>
//             {/* Overlay */}
//             <div
//                 className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-in-out ${
//                     visible ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
//                 }`}
//                 onClick={onClose}
//             />

//             {/* Chevron Close Button */}
//             <div
//                 className={`fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-in-out hidden sm:block ${
//                     visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
//                 } right-[calc(35.8%+12px)] lg:right-[calc(35.8%+12px)] md:right-[calc(60%+12px)] sm:right-[calc(80%+12px)]`}
//             >
//                 <button
//                     onClick={onClose}
//                     className="w-10 h-10 flex items-center justify-center rounded-full shadow-md border bg-white border-gray-300 hover:bg-gray-100 transition-colors"
//                 >
//                     <ChevronRight
//                         className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
//                             visible ? 'rotate-0' : 'rotate-180'
//                         }`}
//                     />
//                 </button>
//             </div>

//             {/* Sidebar */}
//             <div
//                 className={`fixed top-0 right-0 h-full bg-white shadow-lg z-50 p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
//                     visible ? 'translate-x-0' : 'translate-x-full'
//                 } w-full sm:w-[80%] md:w-[60%] lg:w-[35.8%]`}
//             >
//                 <div className="flex items-center justify-between mb-6">
//                     <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
//                         <Image src="/sidebar-close-icon.svg" alt="Close" width={20} height={20} />
//                     </button>
//                     <h3 className="text-2xl font-semibold flex-1 text-center">Upload your work</h3>
//                     <div className="w-9" />
//                 </div>

//                 {/* Title */}
//                 <div className="mb-4">
//                     <label className="block text-sm font-bold mb-4 text-left">Project Title</label>
//                     <input
//                         type="text"
//                         value={currentWork.title || ''}
//                         onChange={handleTitleChange}
//                         placeholder="What is the title of your project?"
//                         className={`w-full px-4 py-2 border ${
//                             showTitleError ? 'border-red-500' : 'border-[#4F4F4F]'
//                         } rounded-3xl focus:outline-none focus:ring-2 ${
//                             showTitleError ? 'focus:ring-red-500' : 'focus:ring-blue-500'
//                         }`}
//                     />
//                     {showTitleError && (
//                         <p className="text-red-500 text-sm mt-1">
//                             Please enter a project title before uploading
//                         </p>
//                     )}
//                 </div>

//                 {/* Images */}
//                 <div className="mb-4">
//                     <label className="block text-sm font-bold mb-4 text-left">
//                         Upload project images (max 4)
//                     </label>
//                     <div className="border-2 border-dashed bg-[#F8F8F8] border-[#BDBDBD] p-6 text-center">
//                         <Image
//                             src="/upload-icon.svg"
//                             alt="upload-logo"
//                             width={20}
//                             height={20}
//                             className="w-8 h-8 mx-auto mb-2"
//                         />
//                         <p className="text-sm text-gray-600">Drag and drop here</p>
//                         <p className="text-sm text-gray-600">Or</p>
//                         <input
//                             type="file"
//                             multiple
//                             accept="image/*"
//                             onChange={handleImageUpload}
//                             className="hidden"
//                             id="image-upload"
//                         />
//                         <label htmlFor="image-upload" className="cursor-pointer underline text-sm">
//                             Upload from Device
//                         </label>
//                     </div>
//                     {currentWork.previewUrls?.length > 0 && (
//                         <div className="mt-3 grid grid-cols-2 gap-2">
//                             {currentWork.previewUrls.slice(0, 4).map((url, index) => (
//                                 <img
//                                     key={index}
//                                     src={url}
//                                     alt={`Preview ${index + 1}`}
//                                     className="w-full h-16 object-cover rounded-lg"
//                                 />
//                             ))}
//                         </div>
//                     )}
//                 </div>

//                 {/* Description */}
//                 <div className="mb-4">
//                     <label className="block text-sm font-bold mb-4 text-left">
//                         Project Description
//                     </label>
//                     <textarea
//                         value={currentWork.description || ''}
//                         onChange={(e) =>
//                             setCurrentWork({ ...currentWork, description: e.target.value })
//                         }
//                         placeholder="Write a short description about the work"
//                         rows={3}
//                         className="w-full px-4 py-2 border border-[#4F4F4F] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>

//                 {/* Tags */}
//                 <div className="mb-6">
//                     <label className="block text-sm font-bold mb-4 text-left">Project Tag</label>
//                     <div className="flex flex-wrap gap-2 border border-[#4F4F4F] px-3 py-2 rounded-md min-h-[3rem]">
//                         {currentWork.tags?.map((tag, index) => (
//                             <span
//                                 key={index}
//                                 className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
//                             >
//                                 {tag}
//                                 <button onClick={() => handleRemoveTag(tag)}>×</button>
//                             </span>
//                         ))}
//                         <input
//                             type="text"
//                             placeholder="Type a tag and press Enter"
//                             className="flex-grow text-sm px-2 py-1 focus:outline-none min-w-[120px]"
//                             onKeyDown={(e) => {
//                                 if (e.key === 'Enter') {
//                                     handleAddTag(e.currentTarget.value);
//                                     e.currentTarget.value = '';
//                                 }
//                             }}
//                         />
//                     </div>
//                 </div>

//                 {/* Upload button */}
//                 <button
//                     onClick={handleUploadWork}
//                     disabled={!currentWork.title?.trim() || !currentWork.images?.length}
//                     className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
//                 >
//                     Upload
//                 </button>
//             </div>
//         </>
//     );
// }
