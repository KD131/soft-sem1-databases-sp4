import redis from "@/lib/redis";
import { NextApiRequest, NextApiResponse } from "next";
import { getUser } from "./[id]";

type User = {
    id: string;
    name: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const users = await redis.smembers("users");
    const usersData = await Promise.all(users.map((id: string) => getUser(id)));
    return res.status(200).json(usersData);
}