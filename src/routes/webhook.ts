import { t, type Elysia } from "elysia";
import prisma from "../lib/prisma";
import logger from "../lib/logger";

export const webhookRoutes = (app: Elysia) =>
  app.group("/webhook", (app) =>
    app

      .post("/copperx", async ({ body, headers, set }) => {
        const type = body.type;
        switch(type) {
            case "checkout_session.completed": {
                const checkoutSession = body.data.object;
                const customerId = checkoutSession.customerId;
                const amount = checkoutSession.amountNet / 10**8;
                const customer = await prisma.user.findUnique({
                    where: { stripe_id: customerId }
                })
                logger.info(customer)
                logger.info(amount)
                if (!customer) {
                    set.status = 404
                    return {
                        message: "Customer not found"
                    } as const
                }
                await prisma.credits.upsert({
                    where: { user_id: customer.id },
                    update: {
                        credits: { increment: amount }
                    },
                    create: { user_id: customer.id, credits: amount }
                })
                await prisma.user.update({
                    where: { id: customer.id },
                    data: {
                        subscription_valid_until: new Date(checkoutSession.expiresAt),
                        subscription_tier: amount.toString()
                    }
                })
                break;
            }
        }
        return {
          message: "Copperx webhook received",
        };
      }, {
        body: t.Object({
          id: t.String(),
          apiVersion: t.String(),
          created: t.Number(),
          object: t.String(),
          type: t.String(),
          data: t.Object({
            object: t.Any()
          })
        })
      })
  );
