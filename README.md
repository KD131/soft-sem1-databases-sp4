# SP4
## Table of contents
- [SP4](#sp4)
  - [Usage](#usage)
  - [API](#api)
  - [Configurations](#configurations)
    - [Replication](#replication)
    - [Security](#security)
  - [Status](#status)
  - [Reflections](#reflections)
- [Next.js](#nextjs)
  - [Getting Started](#getting-started)
  - [Learn More](#learn-more)
  - [Deploy on Vercel](#deploy-on-vercel)

This assignment is about Redis and using specific configurations of Redis to make a CRUD application. We had different configurations to choose from and had to setup at least 2, and make use of at least 1 in the application. Makes sense to just use the two in the application to demonstrate the setup.

## Usage
Configure environment variables. I apologise that this step is tedious.
1. Go to the edit `.env*.example` files.
2. Fill out the values.
   1. `REDIS_URL="redis://localhost:6379"`
   2. Passwords in `.env.local` and `.env.docker` can be whatever you want.
3. Copy or rename them to remove the `.example` part.
4. Go to `conf/users.acl`.
5. Edit the `#<hashes>` to `><your_password>` (or hashes if you feel like it).

To start the Redis servers:
```shell
docker compose --env-file .env.docker up
```

I sort of made a mess of the folder structure so both Docker and Next.js are in this folder. If the Docker environment file was the default `.env`, then Next would read from it as well. For some reason specifying the `env_file` attribute in `docker-compose.yml` just fails.

To run the Next.js application:
```shell
npm install
npm run dev
```

To get some test data:
1. Docker exec into the master Redis server, or use Docker Desktop to open a terminal.
2. ```shell
    cat /etc/redis/conf/data.txt | redis-cli --pipe --user admin
    ```

## API
There's no frontend. Given more time, it would've been nice to have that set up. Instead I've got an API at `/api/`.

- **`/api/users`**: Get all users
- **`/api/users/[id]`**: GET/POST/PUT/DELETE on a user

A user looks like this:
```
{
    "name": "Dave",
    "email": "dave@example.com",
    "games": [
        "The Witcher 3: Wild Hunt",
        "Prey",
        "Ori and the Will of the Wisps"
    ]
}
```

Here's another just for good measure:

```
{
    "name": "Eve",
    "email": "eve@example.com",
    "games": [
        "The Witcher 3: Wild Hunt",
        "Dota 2",
        "Portal"
    ]
}
```

Please don't `PUT` with a missing or empty games list. It works fine with `POST` because I implemented it differently.

## Configurations
I've picked the [**replication**](#replication) and [**security**](#security) configurations.

At first, I wanted to use the clustering (sharding/partitioning) configuration because that's what we demoed in class, but on reading the documentation, it might only work on Linux. [This](https://redis.io/docs/management/scaling/#redis-cluster-and-docker) states that it depends on the Docker `--net=host` networking option, but the [Docker documentation](https://docs.docker.com/network/host/) states that host networking only works on Linux.

Replication and security it is!

### Replication
I've set up two Redis servers, one master and one replica. The replica specifies `replicaof redis 6479` in its config file. This could also be done as an option to the CLI command. That's really all there is to it. `redis` in this sense is the master Redis instance as defined in `docker-compose.yml`.

If the master fails, the replica takes over. When the master comes back, it attempts to do a partial resynchronisation.

### Security
I set up an ACL with a password-protected default and admin user. The default user has all dangerous commands disabled so they can't wipe the whole database with `FLUSHDB` or `FLUSHALL`. However, I specifically enabled `INFO` because the `ioredis` Node client uses it when establishing a connection.

I enabled the ACL on both master and replica server, though I don't know if that's strictly needed.

The replica server needs the admin password to connect to the master because the default user does not have permission to run those commands.

I've included the `conf/user.acl` file to show the user configuration, but I've stored the passwords as hashes for security reasons, even though it does not matter in this small project.


## Status
- [x] Replication
- [x] Security
- [x] Full CRUD
- [ ] Frontend

## Reflections
I experimented with both `Promise.all()` and `redis.multi()` for handling multiple operations. `multi` starts a transaction in Redis which is great for when all operations have to succeed, whereas `Promise.all` would probably return an error or something but still execute some of the database operations.

As previously mentioned, `PUT` is error-prone. I implemented it with `multi` which uses chaining. That's great for writing quick code, but I'm not sure what the best way is to make one of the calls optional. What I did with `POST` (`Promise.all`) allows me to just return null instead of calling a database operation.

Redis only stores strong values for a hash, so to create complex objects, like also having a list of games, I stored those as a set. I had to assemble/dissamble it into/from a full user object.

***
# Next.js
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
