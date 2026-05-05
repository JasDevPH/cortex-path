import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma as db } from "@cortexpath/database";
import { admin as adminPlugin, username } from "better-auth/plugins";
import { ac, admin, user } from "./permission";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || "BUILD_TIME_SECRET_REPLACE_ME",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    emailAndPassword: {
        enabled: true,
        autoSignIn: false
    },
    plugins: [
        username(),
        adminPlugin({
            ac,
            roles: {
                admin,
                user,
            },
            defaultRole: "user",
            adminRoles: ["admin"],
        }),
    ],
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),
});