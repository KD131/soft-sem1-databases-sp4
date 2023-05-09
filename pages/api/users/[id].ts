import redis from "@/lib/redis";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const user = await redis.hgetall(`user:${id}`);
  res.status(200).json(user)
}