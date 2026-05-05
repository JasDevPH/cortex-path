import FileMap from "@/components/map/file-map";
import Image from "next/image";

export default function Home() {
  return (
    <main>
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
