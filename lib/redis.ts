import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
    password: process.env.DEFAULT_PWD,
});

export default redis;