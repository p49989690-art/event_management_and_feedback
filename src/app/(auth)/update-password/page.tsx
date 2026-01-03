"use client";

import { useActionState, Suspense } from "react";
import { updatePassword } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";

function UpdatePasswordForm() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const [state, formAction, isPending] = useActionState(async (state: null, payload: FormData) => {
        await updatePassword(payload);
        return null;
    }, null);

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Set new password
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Please enter your new password below.
                    </p>
                </div>

                <form className="mt-8 space-y-6" action={formAction}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-1"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="mt-1"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                            {isPending ? "Updating..." : "Update Password"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function UpdatePasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UpdatePasswordForm />
        </Suspense>
    );
}
