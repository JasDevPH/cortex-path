import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/get-session';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cortex-path.up.railway.app';

export const metadata: Metadata = {
  title: 'CortexPath — AI-Powered Codebase Intelligence for Developers',
  description:
    'CortexPath mirrors your entire codebase to the cloud in minutes. Get instant plain-English logic interpretation, visual architecture maps, blast-radius analysis, and an AI chat assistant that knows your code — zero install, any language.',
  openGraph: {
    title: 'CortexPath — AI-Powered Codebase Intelligence',
    description:
      'Zero-install codebase intelligence. Ingest any project, get logic summaries, explore interactive architecture maps, and ask an AI anything about your code.',
    url: APP_URL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CortexPath — AI-Powered Codebase Intelligence',
    description:
      'Mirror your codebase to the cloud. Logic summaries, architecture maps, blast-radius analysis, and AI chat — all from your browser.',
  },
  alternates: {
    canonical: APP_URL,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'CortexPath',
      url: APP_URL,
      logo: `${APP_URL}/logo.png`,
      description: 'AI-powered codebase intelligence platform for software developers.',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'CortexPath',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      url: APP_URL,
      description:
        'CortexPath mirrors your codebase to the cloud, providing plain-English logic interpretation, interactive architecture maps, dependency blast-radius analysis, and an AI assistant that answers questions about your code.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Plain-English logic summaries powered by Groq AI',
        'Interactive architecture dependency maps',
        'Blast-radius impact analysis',
        'Vector-based semantic code search',
        'AI chat assistant with codebase context',
        'Zero-install browser-based ingestion',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is CortexPath?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'CortexPath is an AI-powered codebase intelligence tool. It reads your local project files through your browser, generates plain-English logic summaries using Groq AI, builds a visual architecture map of your dependencies, and lets you chat with an AI assistant that has full context about your code.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does CortexPath upload my source code?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'CortexPath reads files locally in your browser. Only vector embeddings and AI-generated summaries are synced to the cloud — your raw source code is never stored on our servers.',
          },
        },
        {
          '@type': 'Question',
          name: 'What programming languages does CortexPath support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'CortexPath supports TypeScript, JavaScript, Python, Go, Rust, Java, C#, C++, Vue, Svelte, Ruby, PHP, Swift, Kotlin, and more.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I get started with CortexPath?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Create a free account, click "Select project folder" in the dashboard, and CortexPath will ingest your codebase in minutes. No installation, no CLI, no configuration required.',
          },
        },
      ],
    },
  ],
};

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromHeaders();
  if (session?.user) redirect('/app');
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
