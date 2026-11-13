// Creates the first admin from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
// Safe to re-run: an existing user is left as is.
import { Role } from "./roles";
import { createUserWithPassword } from "./users";

const email = process.env["SEED_ADMIN_EMAIL"];
const password = process.env["SEED_ADMIN_PASSWORD"];
if (!email || !password) {
  console.error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in server/.env");
  process.exit(1);
}

const user = await createUserWithPassword({ email, password, name: "Admin", role: Role.Admin });
console.log(user ? `Created admin ${email}.` : `Admin ${email} already exists, nothing to do.`);

process.exit(0);
