"use client"

import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-provider";

export default function MapClient() {
    const confirm = useConfirm()

    const confirmSignOut = async () => {
        const ok = await confirm({
            title: "Confirm Sign Out",
            description: "Are you sure you want to sign out?",
            confirmText: "Sign out",
            cancelText: "Cancel",
        })

        if (ok){
            signOut()
        }
    }

    return (
        <div>
            <div className="absolute top-4 right-15 z-50">
                <Button className="hover:cursor-pointer" onClick={confirmSignOut}>Logout</Button>
            </div>
            <div className="absolute bottom-10 left-0 right-0 flex justify-center z-50 gap-2">
                <Button size="lg" className="hover:cursor-pointer" variant="outline">Upload</Button>
                <Button size="lg" className="hover:cursor-pointer" variant="destructive">Delete</Button>
            </div>
        </div>
    );
}