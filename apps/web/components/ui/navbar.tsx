"use client"

import Link from "next/link";
import { Button, buttonVariants } from "./button";
// import { ThemeToggle } from "./ui/theme-toggle";
import SignInPage from "@/app/auth/sign-in/page";
import { useState } from "react";

export function Navbar() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    function openModal() {
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    return (
        <nav className="w-full p-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <Link href="/">
                    <h1 className="text-3xl font-bold">
                        CortexPath
                    </h1>
                </Link>

                <div className="flex items-center gap-2">
                    {/* <Link className={buttonVariants({variant: "ghost"})} href="/">About</Link> */}
                    {/* <Link className={buttonVariants({variant: "ghost"})} href="/">Create</Link> */}
                    {/* <ThemeToggle /> */}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Link className={buttonVariants()} href="/auth/sign-up">Sign up</Link>
                {/* <Link className={buttonVariants({variant: "secondary"})} href="/auth/sign-in">Login</Link> */}
                <Button className={buttonVariants({variant: "secondary"})} onClick={openModal}>Login</Button>
            </div>

            {isModalOpen && <SignInPage onClose={closeModal} />}
        </nav>
    )
}