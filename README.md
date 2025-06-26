# hyper-alerts

High-performance indexer for Hyperliquid price data. Runs a cron job to fetch prices and sends alerts for liquidations.

## Features

-   Indexes Hyperliquid price data in real-time
-   Cron job checks for liquidation alerts every second
-   Telegram bot notifications for user alerts
-   REST API for user and alert management

## Architecture

-   **Bun** runtime for speed
-   **Elysia** for API server
-   **Prisma** with PostgreSQL for persistence
-   **@nktkas/hyperliquid** for price data
-   **node-telegram-bot-api** for notifications

## Setup

1. Clone the repo
2. Install dependencies:
    ```bash
    bun install
    ```
3. Set up your `.env` file (see below)
4. Run database migrations:
    ```bash
    bun run prisma:migrate
    ```
5. Start the server:
    ```bash
    bun run index.ts
    ```
6. (Optional) Start the cron job:
    ```bash
    bun run src/cron/index.ts
    ```

## Environment Variables

-   `PORT` - Port to run the API server
-   `DATABASE_URL` - PostgreSQL connection string
-   `ENV` - `development` or `production`
-   `TELEGRAM_BOT_TOKEN` - Telegram bot token

## Usage

-   API server runs on the specified `PORT`
-   Cron job checks for unacknowledged alerts and triggers notifications
-   Telegram bot listens for `/register` commands

## API Endpoints

### User

-   `POST /user/add-user` - Add a user `{ address, pdId, telegramId, email }`
-   `GET /user/user-positions?wallet=0x...` - Get user positions
-   `POST /user/set-alert` - Set an alert `{ asset, liqPrice, address, direction }`

### Utility

-   `GET /health` - Health check
-   `GET /ping` - Ping

## Database Schema (Prisma)

-   **User**: id, address, pd_id, telegram_id, email, createdAt, updatedAt
-   **Alert**: id, coin, liq_price, user_address, acknowledged, direction, createdAt, updatedAt

## Contributing

PRs welcome. Use functional programming, minimal comments.

## License

MIT
