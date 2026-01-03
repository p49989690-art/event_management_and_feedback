"use client";

import { useActionState, Suspense } from "react";
import { resetPassword } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ForgotPasswordForm() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const message = searchParams.get("message");
    const [state, formAction, isPending] = useActionState(async (state: null, payload: FormData) => {
        await resetPassword(payload);
        return null;
    }, null);

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Reset your password
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Enter your email address and we'll send you a link to reset your
                        password.
                    </p>
                </div>

                <form className="mt-8 space-y-6" action={formAction}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <Label htmlFor="email-address" className="sr-only">
                                Email address
                            </Label>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="Email address"
                                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-neutral-900 dark:ring-neutral-800 dark:text-white"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="text-green-500 text-sm text-center bg-green-50 dark:bg-green-900/20 p-2 rounded">
                            {message}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                            {isPending ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </div>

                    <div className="text-sm text-center">
                        <Link
                            href="/login"
                            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                        >
                            Back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ForgotPasswordForm />
        </Suspense>
    );
}
