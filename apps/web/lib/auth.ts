import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma as db } from "@cortexpath/database";
import { admin as adminPlugin, username } from "better-auth/plugins";
import { ac, admin, user } from "./permission";

export const auth = betterAuth({
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