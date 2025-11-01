'use client';

import { ArrowLeft } from 'lucide-react';

type ProgressHeaderProps = {
    step: number;
    onBack: () => void;
};

export default function ProgressHeader({ step, onBack }: ProgressHeaderProps) {
    const circleMap = {
        1: [3],
        2: [4],
        3: [5, 6],
        4: [7],
    };

    const getCircleStatus = (currentStep: number) => {
        const status = ['', '', '', ''];
        let activeIndex = -1;

        Object.entries(circleMap).forEach(([_, steps], index) => {
            if (steps.includes(currentStep)) {
                activeIndex = index;
            }
            if (steps[steps.length - 1] < currentStep) {
                status[index] = 'checked';
            }
        });

        if (activeIndex !== -1) {
            status[activeIndex] = 'active';
        }

        return status;
    };

    const status = getCircleStatus(step);
    const labels = [1, 2, 3, 4];

    if (step < 3 || step > 7) return null;

    return (
        <div className="relative w-full min-h-[80px] flex flex-col justify-start">
            {/* Go Back Button */}
            <div className="absolute top-4 sm:top-1/2 left-4 sm:left-8 z-10 ">
                <button
                    onClick={onBack}
                    className="flex items-start lg:items-center text-xs sm:text-base text-black font-bold pb-20 sm:pb-0"
                >
                    <ArrowLeft size={18} className="mr-1" />
                    Go Back
                </button>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col justify-center items-center flex-grow mt-16 sm:mt-0">
    <div className="relative w-[90%] max-w-[280px] sm:max-w-[320px] md:max-w-[360px] h-8 sm:h-9 md:h-10">
        {/* Line behind circles */}
        <div className="absolute top-1/2 left-0 right-0 h-[1.5px] sm:h-[2px] bg-[#E0E0E0] z-0 transform -translate-y-1/2"></div>

        {/* Circles */}
        <div className="relative z-10 flex justify-between items-center h-full">
            {status.map((state, index) => (
                <div
                    key={index}
                    className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-200
                        ${
                            state === 'active' || state === 'checked'
                                ? 'bg-[#1D40C8] text-white'
                                : 'bg-white border-2 border-[#E0E0E0] text-[#828282]'
                        }`}
                >
                    {state === 'checked' ? '✓' : labels[index]}
                </div>
            ))}
        </div>
    </div>
</div>
        </div>
    );
}



















// 'use client';

// import { ArrowLeft } from 'lucide-react';

// type ProgressHeaderProps = {
//     step: number;
//     onBack: () => void;
// };

// export default function ProgressHeader({ step, onBack }: ProgressHeaderProps) {
//     const circleMap = {
//         1: [3, 4, 5],
//         2: [6],
//         3: [7],
//         4: [8],
//     };

//     const getCircleStatus = (currentStep: number) => {
//         const status = ['', '', '', ''];
//         let activeIndex = -1;

//         Object.entries(circleMap).forEach(([_, steps], index) => {
//             if (steps.includes(currentStep)) {
//                 activeIndex = index;
//             }
//             if (steps[steps.length - 1] < currentStep) {
//                 status[index] = 'checked';
//             }
//         });

//         if (activeIndex !== -1) {
//             status[activeIndex] = 'active';
//         }

//         return status;
//     };

//     const status = getCircleStatus(step);
//     const labels = [1, 2, 3, 4];

//     if (step < 3 || step > 11) return null;

//     return (
//         <div className="relative w-full mt-12 mb-10 h-12">
//             {/* Go Back Button - Left Aligned */}
//             <button
//                 onClick={onBack}
//                 className="absolute left-10 top-1/2 -translate-y-1/2 flex items-start text-sm text-black text-[16px] font-bold"
//             >
//                 <ArrowLeft size={20} className="mr-1" />
//                 Go Back
//             </button>

//             {/* Progress Bar - Centered Absolutely */}
//             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px]">
//                 <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#E0E0E0] z-0 transform -translate-y-1/2" />

//                 {/* Circles */}
//                 <div className="relative z-10 flex justify-between items-center">
//                     {status.map((state, index) => (
//                         <div
//                             key={index}
//                             className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
//             ${state === 'active' || state === 'checked'
//                                     ? 'bg-[#1D40C8] text-white'
//                                     : 'bg-white border-2 border-[#E0E0E0] text-[#828282]'}
//         `}
//                         >
//                             {state === 'checked' ? '✓' : labels[index]}
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// }
