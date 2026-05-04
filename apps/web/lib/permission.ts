import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
    ...defaultStatements,
    dashboard: ["view"],
    task: ["create", "share", "update", "delete", "view"], // <-- Permissions available for created roles
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({ 
    dashboard: ["view"],
    task: ["create", "update", "delete", "view"], 
}); 

export const admin = ac.newRole({ 
    dashboard: ["view"],
    task: ["create", "update", "view"], 
    ...adminAc.statements,
}); 

// export const myCustomRole = ac.newRole({ 
//     project: ["create", "update", "delete"], 
//     user: ["ban"], 
// }); 