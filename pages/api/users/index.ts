import redis from "@/lib/redis";
import { NextApiRequest, NextApiResponse } from "next";

type User = {
    id: string;
    name: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await redis.hgetall("user:Alice");
    res.status(200).json(user)
}