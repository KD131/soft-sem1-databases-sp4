# SP4
This assignment is about Redis and using specific configurations of Redis to make a CRUD application. We had different configurations to choose from and had to setup at least 2, and make use of at least 1 in the application. Makes sense to just use the two in the application to demonstrate the setup.

I've picked the **replication** and **security** configurations.

At first, I wanted to use the clustering (sharding/partitioning) configuration because that's what we demoed in class, but on reading the documentation, it might only work on Linux. [This](https://redis.io/docs/management/scaling/#redis-cluster-and-docker) states that it depends on the Docker `--net=host` networking option, but the [Docker documentation](https://docs.docker.com/network/host/) states that host networking only works on Linux.

Replication and security it is!

## Usage
To start the Redis servers:
```shell
docker compose up
```

To run the Next.js application:
```shell
npm install
npm run dev
```

***

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
