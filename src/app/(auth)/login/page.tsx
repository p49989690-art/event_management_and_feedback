import Link from 'next/link'
import { login } from '@/actions/auth.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/ui/submit-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md dark:bg-neutral-900 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Sign In
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form action={login}>
          <CardContent className="space-y-4">
            {params.message && (
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-400">
                {params.message}
              </div>
            )}
            {params.error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
                {params.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="dark:bg-neutral-800 dark:border-neutral-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="dark:bg-neutral-800 dark:border-neutral-700"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <SubmitButton className="w-full" loadingText="Signing in...">
              Sign In
            </SubmitButton>
            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
