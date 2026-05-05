"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInFormSchema } from "@/lib/zod/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldGroup, FieldError } from "@/components/ui/field";
import { onSignIn } from "@/app/auth/actions";
import { useRouter } from "next/navigation";
import { notification } from "@/components/ui/notification";

export default function SignInForm() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form
      onSubmit={form.handleSubmit(async (values) => {
        const res = await onSignIn(values);

        if (!res.success) {
          notification({ type: "error", message: "Incorrect credentials" });
          return;
        }

        router.push("/");
        router.refresh();

        notification({ type: "success", message: "Signed in successfully!" });
      })}
    >
      <FieldGroup className="gap-y-4">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input placeholder="john@doe.com" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input type="password" placeholder="********" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </FieldGroup>
    </form>
  );
}