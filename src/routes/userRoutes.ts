import { Elysia, t } from "elysia";
import {
    getUserPositions,
    setAlert,
    getAlerts,
    acknowledgeAlert,
    getUser,
    updateUser,
} from "../controllers/userController";
import { Direction } from "../lib/constants";

export const userRoutes = (app: Elysia) =>
    app.group("/user", (app) =>
        app
            .get("/user-positions", getUserPositions, {
                query: t.Object({
                    wallet: t.String(),
                }),
            })
            .get("/alerts", getAlerts, {
                query: t.Object({
                    wallet: t.String(),
                }),
            })
            .post("/set-alerts", setAlert, {
                body: t.Object({
                    alerts: t.Array(
                        t.Object({
                            asset: t.String(),
                            liqPrice: t.String(),
                            address: t.String(),
                            size: t.String(),
                            margin: t.String(),
                            leverage: t.String(),
                            direction: t.String({
                                enum: Object.values(Direction),
                            }),
                        })
                    ),
                }),
            })
            .post("/acknowledge-alerts", acknowledgeAlert, {
                body: t.Object({
                    alert: t.String(),
                }),
            })
            .post("/update-user", updateUser, {
                body: t.Object({
                    id: t.String(),
                    address: t.Optional(t.String()),
                    pd_id: t.Optional(t.String()),
                    telegram_id: t.Optional(t.String()),
                    email: t.Optional(t.String()),
                    threshold: t.Optional(t.Number()),
                }),
            })
            .get("/", getUser, {
                query: t.Object({
                    wallet: t.String(),
                }),
            })
    );
