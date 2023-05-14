import redis from "@/lib/redis";
import { NextApiRequest, NextApiResponse } from "next";

export async function postUser(id: string, data: any) {
    redis.hset(`user:${id}`, data);
    return data;
}

export async function getUser(id: string) {
    const userCall = redis.hgetall(`user:${id}`) as Promise<Record<string, any>>;
    const gamesCall = redis.smembers(`user:${id}:games`);
    const [user, games] = await Promise.all([userCall, gamesCall]);
    user.games = games;
    return user;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;
    let user = null;

    if (req.method === "GET") {
        user = await getUser(id as string);
    }
    else if (req.method === "POST") {
        user = await postUser(id as string, req.body);


    }

    res.status(200).json(user);
}