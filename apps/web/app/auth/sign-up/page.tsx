"use client"

import { SignupFormSchema } from "@/lib/zod/validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { onSignup } from "@/app/auth/actions";

export default function SignUpPage(){
    const form = useForm({
        resolver: zodResolver(SignupFormSchema),
        defaultValues: {
            name: "",
            username: "",
            email: "",
            password: "",
        }
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sign up</CardTitle>
                <CardDescription>Create an account to get started</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSignup)}>
                    <FieldGroup className="gap-y-4">
                        <Controller 
                            name="name" 
                            control={form.control} 
                            render={({field, fieldState}) => (
                                <Field>
                                    <FieldLabel>Full Name</FieldLabel>
                                    <Input aria-invalid={fieldState.invalid} placeholder="John Doe" {...field} />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                        )}/>

                        <Controller 
                            name="username" 
                            control={form.control} 
                            render={({field, fieldState}) => (
                                <Field>
                                    <FieldLabel>Username</FieldLabel>
                                    <Input aria-invalid={fieldState.invalid} placeholder="johndoe123" {...field} />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                        )}/>

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
                                    Signing up...
                                </span>
                            ) : (
                                "Sign up"
                            )}
                        </Button>

                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}