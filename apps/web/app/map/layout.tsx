import { ReactNode } from 'react';
import { ChatWidget } from '@/components/chat/ChatWidgetLoader';

export default function MapLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}
