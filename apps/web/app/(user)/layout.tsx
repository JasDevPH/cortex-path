import { Navbar } from "@/components/ui/navbar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ReactNode } from "react";

export default function SharedLayout({children, modal} : Readonly<{children: ReactNode; modal: ReactNode;}>){
    return (
        <div className="relative">
            {/* <Navbar /> */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            {children}
            {modal}
        </div>
    )
}