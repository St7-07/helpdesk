import { db } from "./prisma/db";

// Staff roles. Single source of truth is the `Role` enum in
// src/prisma/contract.prisma; this re-exports it for app code.
const RoleEnum = db.enums.public.Role;

/** `Role.Admin` → "admin", `Role.Agent` → "agent" */
export const Role = RoleEnum.members;
export type Role = (typeof Role)[keyof typeof Role];
/** ["admin", "agent"] */
export const roles = RoleEnum.values;
