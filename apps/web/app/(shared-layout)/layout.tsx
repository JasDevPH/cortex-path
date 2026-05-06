import { ReactNode } from "react";
import { ChatWidget } from "@/components/chat/ChatWidgetLoader";

export default function SharedLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}