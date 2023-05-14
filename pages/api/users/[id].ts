import redis from "@/lib/redis";
import { NextApiRequest, NextApiResponse } from "next";

// It's not great error handling but it's something.
// Obviously there should be more.

export async function postUser(id: string, data: any) {
    if (await redis.exists(`user:${id}`)) {
        throw new Error("User already exists");
    }

    const { games, ...user } = data;

    const setUser = redis.hset(`user:${id}`, user);
    // arrow function and promise hell
    // should probably be refactored
    const setGames = (() => {
        if (games?.length > 0) {
            return redis.sadd(`user:${id}:games`, games);
        }
    })();

    const res = await Promise.all([setUser, setGames]);
    return res;
}

// using Promise.all
export async function getUser(id: string) {
    const userCall = redis.hgetall(`user:${id}`) as Promise<Record<string, any>>;
    const gamesCall = redis.smembers(`user:${id}:games`);
    const [user, games] = await Promise.all([userCall, gamesCall]);
    user.games = games;
    return user;
}

// using multi
export async function getUser2(id: string) {
    // I ignore the error elements
    const [[, user], [, games]] = await redis.multi()
        .hgetall(`user:${id}`)
        .smembers(`user:${id}:games`)
        .exec()
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
        user = await getUser2(id as string);
    }
    else if (req.method === "POST") {
        try {
            user = await postUser(id as string, req.body);
        } catch (error: any) {
            res.status(409).json({
                status: 409,
                error: error.message
            });
            return;
        }
    }

    res.status(200).json(user);
}