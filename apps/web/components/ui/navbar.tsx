"use client"

import Link from "next/link";
import { buttonVariants } from "./button";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
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
                    <ThemeToggle />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Link className={buttonVariants()} href="/auth/sign-up">Sign up</Link>
                <Link className={buttonVariants({variant: "secondary"})} href="/auth/sign-in">Login</Link>
            </div>
        </nav>
    )
}
