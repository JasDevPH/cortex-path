import { SignInFormSchema, SignupFormSchema } from "@/lib/zod/validation";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import z from "zod";
import { notification } from "@/components/ui/notification";

export async function onSignIn(values: z.infer<typeof SignInFormSchema>) {
    const { data, error } = await authClient.signIn.email({
    email: values.email,
    password: values.password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    role: data?.user.role,
  };
}

export async function onSignup(values: z.infer<typeof SignupFormSchema>) {
        const { data, error } = await authClient.signUp.email({
            email: values.email, 
            password: values.password, 
            name: values.name, 
            username: values.username,
            callbackURL: "/" 
        }, {
            onRequest: (ctx) => {
                //show loading
            },
            onSuccess: (ctx) => {
                notification({ type: "success", message: "Registered successfully!"});
                redirect("/");
            },
            onError: (ctx) => {
                notification({ type: "error", message: `Error: ${ctx.error.message}`});
            },
        });
    }

export async function signOut(){
    await authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                redirect("/");
            }
        }
    })
}