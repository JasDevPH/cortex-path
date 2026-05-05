"use client"

import SignUpForm from "@/components/form/SignUpForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function SignUpPage() {
  return (
    <Dialog open onOpenChange={() => history.back()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign up</DialogTitle>
          <DialogDescription>Create an account to get started</DialogDescription>
        </DialogHeader>

        <SignUpForm />
      </DialogContent>
    </Dialog>
  );
}