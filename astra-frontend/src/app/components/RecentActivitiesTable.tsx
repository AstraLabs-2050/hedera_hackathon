'use client';

import Image from "next/image";
// import { jsPDF } from "jspdf";

const RecentActivitiesTable = ({ activities }) => {

    const generateInvoice = (item) => {
        const doc = new jsPDF();

        // ---------------- Header ----------------
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Invoice", 105, 20, { align: "center" });

        // Optional: Add company logo
        doc.addImage("/astras-logo.png", "PNG", 160, 10, 40, 20);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        // ---------------- Company Info ----------------
        doc.text("Astra", 20, 35);
        doc.text("123 Main Street", 20, 42);
        doc.text("London, State ZIP", 20, 49);

        // ---------------- Client / Job Info ----------------
        doc.text(`Invoice To: ${item.brand}`, 120, 35);
        doc.text(`Date: ${item.timestamp}`, 120, 49);

        // ---------------- Divider ----------------
        doc.setLineWidth(0.5);
        doc.line(20, 55, 190, 55);

        // ---------------- Job Details Table ----------------
        doc.setFont("helvetica", "bold");
        doc.text("Description", 20, 63);
        doc.text("Amount", 150, 63);

        doc.setFont("helvetica", "normal");
        doc.text(item.description, 20, 70);
        doc.text(`$${item.amount}`, 150, 70);

        // ---------------- Payment Status ----------------
        doc.setFont("helvetica", "bold");
        doc.text("Payment Status:", 20, 85);
        doc.setFont("helvetica", "normal");
        doc.text(item.paymentStatus, 60, 85);

        // ---------------- Total ----------------
        doc.setFont("helvetica", "bold");
        doc.text("Total:", 20, 100);
        doc.text(`$${item.amount}`, 60, 100);

        // ---------------- Save PDF ----------------
        doc.save(`Invoice-${item.id}.pdf`);
    };

    return (
        <div className="font-[ClashGrotesk-regular] mt-10">
            <h2 className="text-2xl font-[ClashGrotesk-bold] mb-4">Recent Activities</h2>

            <div className="overflow-x-auto">
                <div className="min-w-[800px] lg:min-w-[900px] p-6 lg:p-12 border border-[#F6F6F6] rounded-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[#4F4F4F] text-xs lg:text-sm border-b border-b-[#F6F6F6]">
                                <th className="py-3 whitespace-nowrap">Timestamp</th>
                                <th className="py-3 whitespace-nowrap">Description</th>
                                <th className="py-3 whitespace-nowrap">Brand Name</th>
                                <th className="py-3 whitespace-nowrap">Status</th>
                                <th className="py-3 whitespace-nowrap">Amount</th>
                                <th className="py-3 whitespace-nowrap">Payment Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((item, idx) => (
                                <tr
                                    key={idx}
                                    className="bg-white rounded-lg border-b border-b-[#F6F6F6] last:border-b-0 text-sm lg:text-base"
                                >
                                    <td className="py-4 whitespace-nowrap">{item.timestamp}</td>
                                    <td className="py-4 whitespace-nowrap">{item.description}</td>
                                    <td className="py-4 whitespace-nowrap">{item.brand}</td>
                                    <td
                                        className={`py-4 whitespace-nowrap ${item.status === "pending" ? "text-[#EB3173]" : "text-[#25C348]"
                                            }`}
                                    >
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </td>
                                    <td className="py-4 whitespace-nowrap">${item.amount}</td>
                                    <td className="py-4 whitespace-nowrap flex justify-between items-center">
                                        {item.paymentStatus === "Paid" ? (
                                            <span className="text-[#25C348]">Paid</span>
                                        ) : (
                                            "-"
                                        )}
                                        <span
                                            className="flex items-center ml-2 cursor-pointer"
                                            onClick={() => generateInvoice(item)}
                                        >
                                            <Image
                                                src="/invoice.svg"
                                                width={16}
                                                height={16}
                                                alt="Invoice Icon"
                                            />
                                            <span className="ml-2 text-[#1D40C8] underline text-sm lg:text-base">
                                                Invoice
                                            </span>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecentActivitiesTable;
