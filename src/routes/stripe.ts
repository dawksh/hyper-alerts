import type Elysia from "elysia";
import { env } from "../lib/env";
import logger from "../lib/logger";
import stripe from "../lib/stripe";
import prisma from "../lib/prisma";

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
          switch(event.type) {
            case "charge.succeeded":
              const session = event.data.object
              const charge = session.id
              const amount = session.amount / 100
              const user = await prisma.user.findUnique({
                where: {
                  address: session.metadata?.user
                }
              })
              if (!user) {
                logger.error("User not found")
                return {
                  message: "User not found"
                }
              }
              await prisma.payment.create({
                data: {
                  user_id: user.id,
                  amount: amount,
                  stripe_id: charge,
                  mode: session.payment_method || "",
                  payment_id: charge,
                  receipt_url: session.receipt_url || "",
                }
              })
              await prisma.credits.create({
                data: {
                  user_id: user.id,
                  credits: amount,
                }
              })
              break;
          }
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
