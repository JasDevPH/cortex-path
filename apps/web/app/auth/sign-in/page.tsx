"use client"

import { SignInFormSchema } from "@/lib/zod/validation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { onSignIn } from "@/app/auth/actions";
import { useRouter } from "next/navigation";
import { notification } from "@/components/ui/notification";

interface SignInPageProps {
    onClose: () => void;
}

export default function SignInPage({ onClose }: SignInPageProps){
    const form = useForm({
        resolver: zodResolver(SignInFormSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const router = useRouter();

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Login</DialogTitle>
                    <DialogDescription>
                        Enter your credentials
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(async (values) => {
                    const res = await onSignIn(values);

                    if (!res.success) {
                        // show error toast here
                        notification({ type: 'error', message: 'Incorrect credentials'});
                        return;
                    }

                    const url =
                    res.role === "admin" ? "/" : "/";

                    router.push(url);
                    router.refresh();
                    notification({ type: 'success', message: 'Signed in successfully!'});
                })}>
                    <FieldGroup className="gap-y-4">

                        <Controller 
                            name="email" 
                            control={form.control} 
                            render={({field, fieldState}) => (
                                <Field>
                                    <FieldLabel>Email</FieldLabel>
                                    <Input aria-invalid={fieldState.invalid} placeholder="john@doe.com" {...field} />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                        )}/>

                        <Controller 
                            name="password" 
                            control={form.control} 
                            render={({field, fieldState}) => (
                                <Field>
                                    <FieldLabel>Password</FieldLabel>
                                    <Input aria-invalid={fieldState.invalid} placeholder="********" type="password" {...field} />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                        )}/>

                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? (
                                <span className="flex items-center gap-2">
                                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Logging in...
                                </span>
                            ) : (
                                "Login"
                            )}
                        </Button>

                    </FieldGroup>
                </form>
            </DialogContent>
        </Dialog>
    )
}