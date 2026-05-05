"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import SignInForm from "@/components/form/SignInForm";

export default function SignInModal() {
  return (
    <Dialog open onOpenChange={() => history.back()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>Enter your credentials</DialogDescription>
        </DialogHeader>

        <SignInForm />
      </DialogContent>
    </Dialog>
  );
}