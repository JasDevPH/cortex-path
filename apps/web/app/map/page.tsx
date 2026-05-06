import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { ArchitectureMap } from "@/components/map/MapClientWrapper";
import { getSessionFromHeaders } from "@/lib/get-session";
import { prisma } from "@cortexpath/database";
import FileMap, { FileRecord } from "@/components/map/file-map";
import { redirect } from "next/navigation";

export default async function MapPage() {
  const session = await getSessionFromHeaders();

  if (!session) {
    redirect("/")
  }

  const dbFiles = await prisma.file.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      path: true,
      summary: true,
    },
  });

  const files: FileRecord[] = dbFiles.map((file) => ({
    path: file.path,
    summary: file.summary ?? undefined,
  }));

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center gap-3 border-b border-cx-card-border px-6 py-2">
        <BrandLogo href="/app" size="md" />
        <span className="font-mono text-xs text-cx-text-3">
          / architecture-map
        </span>
        <nav className="ml-auto flex items-center gap-4">
          <Link
            href="/app"
            className="flex items-center gap-1.5 font-mono text-xs text-cx-text-3 transition-colors hover:text-cx-accent"
          >
            <ArrowLeft size={11} />
            ingester
          </Link>
        </nav>
        <span className="font-mono text-xs text-cx-text-3">
          click a node · blast radius
        </span>
      </header>
      <div className="flex-1 overflow-hidden">
        {/* <ArchitectureMap /> */}
        <FileMap files={files} />
      </div>
    </div>
  );
}
