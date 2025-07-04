import type Elysia from "elysia";
import { env } from "../lib/env";
import logger from "../lib/logger";
import stripe from "../lib/stripe";

export const stripeRoutes = (app: Elysia) =>
  app.group("/stripe", (app) =>
    app
      .onParse(async ({ request, headers }) => {
        if (headers["content-type"] === "application/json; charset=utf-8") {
          const arrayBuffer = await Bun.readableStreamToArrayBuffer(
            request.body!
          );
          const rawBody = Buffer.from(arrayBuffer);
          return rawBody;
        }
      })
      .post("/webhook", async ({ body, headers }) => {
        try {
          const signature = headers["stripe-signature"];
          const event = await stripe.webhooks.constructEventAsync(
            body as any,
            signature || "",
            env.STRIPE_WEBHOOK_SECRET
          );
          logger.info(event.type);
        } catch (error) {
          logger.error(error);
          return {
            message: "Webhook received",
          };
        }
        return {
          message: "Webhook received",
        };
      })
  );
