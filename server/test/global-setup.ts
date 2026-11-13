import { resetTestDatabase } from "./test-db";

export default async function setup() {
  await resetTestDatabase();
}
