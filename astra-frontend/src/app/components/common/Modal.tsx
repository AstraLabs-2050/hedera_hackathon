'use client';

import { ReactNode, useEffect } from 'react';

type Props = {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    labelledBy?: string;
};

export default function Modal({ open, onClose, children, labelledBy }: Props) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-start md:items-center justify-center bg-black/40 p-0 md:p-6"
            aria-modal="true"
            role="dialog"
            aria-labelledby={labelledBy}
            onMouseDown={onClose}
        >
            <div
                className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:w-[576px] rounded-none md:rounded-2xl overflow-auto shadow-xl"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
