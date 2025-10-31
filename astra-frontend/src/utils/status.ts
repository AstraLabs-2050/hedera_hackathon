// function getStatusDisplay(job) {
//     const now = new Date();
//     const dueDate = job.dueDate ? new Date(job.dueDate) : null;

//     switch (job.status) {
//         case "completed":
//             return { label: "• Completed", color: "text-green-500" };

//         case "withdrawn":
//             return { label: "• Withdrawn", color: "text-red-500" };

//         case "awaiting-decision":
//             return { label: "• Awaiting decision", color: "text-blue-500" };

//         case "not-selected":
//             return { label: "• Not selected by creator", color: "text-red-500" };

//         case "ongoing":
//             if (dueDate) {
//                 const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
//                 const color = daysLeft <= 7 ? "text-red-500" : "text-blue-500";
//                 return { label: `Due on ${dueDate.toLocaleDateString()}`, color };
//             }
//             return { label: "Ongoing", color: "text-blue-500" };

//         default:
//             return { label: "• Unknown status", color: "text-gray-500" };
//     }
// }
