import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 text-center sm:px-6 lg:px-8">
            <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Authentication Error
            </h1>
            <p className="mt-2 text-base text-gray-500 max-w-md">
                There was a problem verifying your identity. The link may have expired or is invalid.
            </p>
            <div className="mt-6">
                <Button asChild>
                    <Link href="/login">Return to Login</Link>
                </Button>
            </div>
        </div>
    )
}
