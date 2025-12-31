"use client";

import { Loader2 } from "lucide-react";

interface LoadingPopupProps {
    message?: string;
}

export function LoadingPopup({ message = "Loading..." }: LoadingPopupProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-lg p-6 shadow-xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {message}
                </p>
            </div>
        </div>
    );
}
