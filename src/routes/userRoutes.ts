import { Elysia, t } from "elysia";
import {
    getUserPositions,
    setAlert,
    addUser,
    getAlerts,
    acknowledgeAlert,
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
                            direction: t.String({
                                enum: Object.values(Direction),
                            }),
                        })
                    ),
                }),
            })
            .post("/acknowledge-alerts", acknowledgeAlert, {
                body: t.Object({
                    alerts: t.Array(t.String()),
                }),
            })
            .post("/add-user", addUser, {
                body: t.Object({
                    address: t.String(),
                    pdId: t.String(),
                    telegramId: t.String(),
                    email: t.String(),
                }),
            })
    );
