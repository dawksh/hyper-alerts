import { Elysia, t } from "elysia";
import prisma from "../lib/prisma";

export const utilRoutes = (app: Elysia) =>
    app
        .get("/health", () => ({ status: "ok" }))
        .get("/ping", () => ({ message: "pong" }))
        .post("/twilio/handle/:alertId", async ({ body, params, set }) => {
            set.headers["content-type"] = "text/xml";
            const digits = body.Digits;

            if (digits === "1") {
                await prisma.alert.update({
                    where: { id: params.alertId },
                    data: { acknowledged: true },
                });

                return `
            <Response>
                <Say>Alert acknowledged successfully. Thank you.</Say>
                <Hangup/>
            </Response>
        `;
            } else {
                return `
            <Response>
                <Say>Invalid option. Goodbye.</Say>
                <Hangup/>
            </Response>
        `;
            }
        }, {
            body: t.Object({
                Digits: t.String(),
            })
        });
