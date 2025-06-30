FROM oven/bun:1.1.13

WORKDIR /app

COPY . .

RUN bun install

RUN bunx prisma generate

CMD ["bun", "src/cron/index.ts"] 