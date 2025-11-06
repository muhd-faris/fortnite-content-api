import {
    drizzle,
    NodePgDatabase
} from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '../db/schema';

type TDrizzleInstance = NodePgDatabase<typeof schema> & {
    $client: Pool;
};

let drizzleInstance: TDrizzleInstance | null = null;

export function getDrizzle() {
    if (drizzleInstance !== null) return drizzleInstance;

    drizzleInstance = drizzle(process.env.DATABASE_URL!, { schema });

    return drizzleInstance;
};