import type Elysia from "elysia";
import { env } from "../lib/env";
import logger from "../lib/logger";
import stripe from "../lib/stripe";
import prisma from "../lib/prisma";
import Stripe from "stripe";

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
          logger.info(`Event: ${event.type}`)
          switch(event.type) {
            case "charge.succeeded": {
              logger.info("Charge succeeded")
              break;
            }
            case "invoice.payment_succeeded": {
              const invoice = event.data.object
              const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id
              const periodEnd = invoice.period_end
              if (!customerId || !periodEnd) break
              const user = await prisma.user.findUnique({
                where: { stripe_id: customerId }
              })
              if (!user) {
                logger.error("User not found")
                return {
                  message: "User not found"
                }
              }
              const amount = invoice.amount_paid / 100
              logger.info(`Amount: ${amount}`)
              await prisma.credits.upsert({
                where: { user_id: user.id },
                update: {
                  credits: { increment: amount }
                },
                create: { user_id: user.id, credits: amount }
              })
              await prisma.payment.create({
                data: {
                  user_id: user.id,
                  amount: amount,
                  stripe_id: invoice.id || "",
                  mode: "subscription",
                  payment_id: invoice.id || "",
                  receipt_url: invoice.hosted_invoice_url || ""
                }
              })
              await prisma.user.update({
                where: { id: user.id },
                data: { subscription_valid_until: new Date(periodEnd * 1000) }
              })
              break;
            }
            
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
