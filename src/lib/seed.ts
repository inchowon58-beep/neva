import { seedDefaultKeywords } from "@/lib/db";

let seeded = false;

export async function ensureSeedData() {
  if (seeded) return;
  await seedDefaultKeywords();
  seeded = true;
}
