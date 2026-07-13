import { SignIn } from '@clerk/nextjs';

export default function SignInPageLegacy() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <SignIn path="/sign-in" forceRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
