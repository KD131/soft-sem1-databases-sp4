import redis from "@/lib/redis";
import { NextApiRequest, NextApiResponse } from "next";

// It's not great error handling but it's something.
// Obviously there should be more.
// At least if it were a normal database API.
// I don't know if we have to be as strict with Redis.

export async function postUser(id: string, data: any) {
    // it will otherwise append to the existing user
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

    // this should be a transaction
    const res = await Promise.all([
        setUser,
        setGames,
        redis.sadd("users", id)
    ]);
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
        .exec();
    user.games = games;
    return user;
}

// this will delete the user first to reset data which is maybe overkill
// I could call the delete function, but then it's not part of the transaction
// maybe there's a way to call a function as argument to multi
export async function putUser(id: string, data: any) {
    const { games, ...user } = data;
    const res = await redis.multi()
        .del(`user:${id}`)
        .del(`user:${id}:games`)
        .hset(`user:${id}`, user)
        .sadd(`user:${id}:games`, games)    // now there's no check if games is empty which will error
        .sadd("users", id)
        .exec();
    return res;
}

export async function deleteUser(id: string) {
    const res = await redis.multi()
        .del(`user:${id}`)
        .del(`user:${id}:games`)
        .srem("users", id)
        .exec();
    return res;
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
    else if (req.method === "PUT") {
        user = await putUser(id as string, req.body);
    }
    else if (req.method === "DELETE") {
        user = await deleteUser(id as string);
    }
    else {
        res.status(405).json({
            status: 405,
            error: "Method Not Allowed"
        });
        return;
    }

    res.status(200).json(user);
}