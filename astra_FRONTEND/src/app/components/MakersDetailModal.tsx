"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    Mail,
    ExternalLink,
    Clock,
    DollarSign,
    ZoomIn,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import ChatWithMakerButton from "./ChatWithMakerButton";

interface MakerDetail {
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
    maker,
    trigger,
}: MakerDetailModalProps) {
    const [open, setOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const projects = maker.selectedProjects || [];

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        Maker Profile
                    </DialogTitle>
                </DialogHeader>

                {/* Profile Info */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <Image
                        src={maker.profileImage}
                        alt={maker.name}
                        width={100}
                        height={100}
                        className="rounded-full object-cover w-24 h-24"
                    />
                    <div className="space-y-2 text-center sm:text-left">
                        <h2 className="text-lg font-medium">{maker.name}</h2>
                        <p className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600">
                            <Mail size={16} />{" "}
                            <a
                                href={`mailto:${maker.email}`}
                                className="text-blue-600 hover:underline"
                            >
                                {maker.email}
                            </a>
                        </p>
                        <p className="text-sm text-gray-600">
                            {maker.yearsOfExperience} years experience
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {maker.skills.map((skill) => (
                                <Badge key={skill} variant="secondary">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Job-specific Info */}
                <div className="mt-4 space-y-2">
                    <p className="flex items-center gap-2 text-gray-700">
                        <DollarSign size={16} className="text-green-600" />
                        Proposed Amount:{" "}
                        <span className="font-medium">${maker.proposedAmount}</span>
                    </p>
                    <p className="flex items-center gap-2 text-gray-700">
                        <Clock size={16} className="text-pink-600" />
                        Timeline: <span className="font-medium">{maker.timeline}</span>
                    </p>
                </div>

                {/* Portfolio Links */}
                <div className="mt-4">
                    <h3 className="font-medium text-gray-900 mb-2">Portfolio</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        {maker.portfolioLinks.map((link, index) => (
                            <li key={index}>
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-600 hover:underline"
                                >
                                    {link} <ExternalLink size={14} />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Selected Projects */}
                {projects.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-medium text-gray-900 mb-3">
                            Selected Projects
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {projects.map((project, index) => (
                                <div
                                    key={project.id}
                                    onClick={() => {
                                        setCurrentIndex(index);
                                        setOpen(true);
                                    }}
                                    className="group cursor-pointer rounded-lg border p-2 hover:shadow-md transition relative"
                                >
                                    <Image
                                        src={project.thumbnail}
                                        alt={project.title}
                                        width={400}
                                        height={250}
                                        className="rounded-md object-cover w-full h-32"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-md">
                                        <ZoomIn className="text-white" size={24} />
                                    </div>
                                    <p className="mt-2 text-sm font-medium text-gray-800">
                                        {project.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 
                            text-white font-medium shadow-sm hover:from-red-600 hover:to-red-700 
                            focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 transition"
                    >
                        Decline
                    </button>
                    <ChatWithMakerButton makerId={maker.makerId} />
                </div>
            </DialogContent>

            {/* Project Gallery Preview */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-4xl rounded-xl">
                    <DialogHeader>
                        <DialogTitle>{projects[currentIndex]?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="relative w-full flex items-center justify-center">
                        <button
                            onClick={handlePrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white hover:bg-black/60 transition"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <Image
                            src={projects[currentIndex]?.thumbnail || ""}
                            alt={projects[currentIndex]?.title || ""}
                            width={1200}
                            height={800}
                            className="rounded-lg object-contain w-full h-auto max-h-[70vh]"
                        />

                        <button
                            onClick={handleNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white hover:bg-black/60 transition"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}
