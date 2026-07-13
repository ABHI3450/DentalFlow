import { SignUp } from '@clerk/nextjs';

export default function SignUpPageLegacy() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <SignUp path="/sign-up" forceRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
