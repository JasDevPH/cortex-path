import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ArchitectureMap } from '@/components/map/MapClientWrapper';

export default function MapPage() {
  return (
    <div className="flex h-screen flex-col bg-[#09090b] text-zinc-100">
      <header className="flex items-center gap-3 border-b border-zinc-800/70 px-6 py-2">
        <Image
          src="/cortexpath_logo.png"
          alt="CortexPath"
          width={130}
          height={40}
          className="h-8 w-auto rounded"
          priority
        />
        <span className="font-mono text-xs text-zinc-600">/ architecture-map</span>
        <nav className="ml-auto flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-teal-400"
          >
            <ArrowLeft size={11} />
            ingester
          </Link>
        </nav>
        <span className="font-mono text-xs text-zinc-700">
          click a node · blast radius
        </span>
      </header>
      <div className="flex-1 overflow-hidden">
        <ArchitectureMap />
      </div>
    </div>
  );
}
