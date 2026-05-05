import FileMap from "@/components/map/file-map";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <FileMap
        files={[
          {
            path: "Cortex-Path/sign-up.tsx",
            summary: "Get Started",
            url: "/auth/sign-up",
          },
          {
            path: "Cortex-Path/sign-in.tsx",
            summary: "Login to your account",
            url: "/auth/sign-in",
          },
        ]}
      />
    </main>
  );
}
