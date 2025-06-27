import prisma from "../lib/prisma";
import hl from "../lib/hl";
import type { Direction } from "../lib/constants";
import logger from "../lib/logger";

export const getUserPositions = async ({ query }: { query: Record<string, unknown> }) => {
    const positions = await hl.clearinghouseState({
        user: query.wallet as `0x${string}`,
    })
    return positions.assetPositions.map(({ position }) => {
        return {
            asset: position.coin,
            size: position.szi,
            entryPrice: position.entryPx,
            collateral: position.marginUsed,
            liquidationPrice: position.liquidationPx,
            leverage: position.leverage,
            direction: position.entryPx > (position.liquidationPx ?? 0) ? "long" : "short",
        }
    })
}
export const setAlert = async ({ body, set }: { body: { alerts: { asset: string, liqPrice: string, address: string, direction: Direction }[] }, set: { status: number } }) => {
    const user = await prisma.user.findUnique({
        where: {
            address: body?.alerts?.[0]?.address,
        },
    })
    if (!user) {
        set.status = 404
        return {
            error: "User not found",
        }
    }
    const alert = await prisma.alert.createMany({
        data: body.alerts.map(({ asset, liqPrice, address, direction }) => ({
            coin: asset,
            liq_price: Number(liqPrice),
            acknowledged: false,
            direction: direction,
            user_address: address,
        }))
    })
    return alert
}
export const acknowledgeAlert = async ({ body }: { body: { alerts: string[] } }) => {
    const alert = await prisma.alert.updateMany({
        where: { id: { in: body.alerts } },
        data: { acknowledged: true, last_alert: new Date() },
    })
    return alert
}
export const addUser = async ({ body }: { body: { address: string, pdId: string, telegramId: string, email: string } }) => {
    const user = await prisma.user.create({
        data: {
            address: body.address,
            pd_id: body.pdId,
            telegram_id: body.telegramId,
            email: body.email,
        },
    })
    return user
}

export const getAlerts = async ({ query }: { query: Record<string, unknown> }) => {
    const alerts = await prisma.alert.findMany({
        where: {
            user: {
                address: query.wallet as `0x${string}`,
            },
            acknowledged: false,
        },
    })
    return alerts
}