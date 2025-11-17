import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from '../db/schema';

export function getDrizzle() {
  return drizzle(process.env.DATABASE_URL!, { schema });
}
