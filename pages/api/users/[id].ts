import redis from "@/lib/redis";
import { NextApiRequest, NextApiResponse } from "next";

export async function postUser(id: string, data: any) {
    const { games, ...user } = data;
    const setUser = redis.hset(`user:${id}`, user);
    const setGames = redis.sadd(`user:${id}:games`, games);
    const res = await Promise.all([setUser, setGames]);
    return res;
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