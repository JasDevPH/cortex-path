import SignUpForm from "@/components/form/SignUpForm";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md border p-6 rounded-lg">
        <h1 className="text-xl mb-4">Register</h1>
        <SignUpForm />
      </div>
    </div>
  );
}