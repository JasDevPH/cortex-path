import { createAuthClient } from "better-auth/react"
import { adminClient, usernameClient } from "better-auth/client/plugins"
import { ac, admin, user } from "./permission"

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [
        usernameClient(),
        adminClient({
            ac,
            roles: {
                admin,
                user
            }
        })
    ]
})