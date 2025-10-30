import { Redis } from '@upstash/redis'

let redis: Redis | null = null

export function getFortniteContentRedis(): Redis {
    if (redis !== null) return redis;

    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    return redis;
};