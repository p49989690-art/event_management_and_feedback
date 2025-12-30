"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CopyLinkButtonProps {
    link: string;
}

export function CopyLinkButton({ link }: CopyLinkButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const fullUrl = `${window.location.origin}${link}`;
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            variant="outline"
            onClick={handleCopy}
            className="dark:border-neutral-700"
        >
            {copied ? (
                <>
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Copied!
                </>
            ) : (
                <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                </>
            )}
        </Button>
    );
}
