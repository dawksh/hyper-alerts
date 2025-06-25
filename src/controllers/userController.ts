import prisma from "../lib/prisma";
import hl from "../lib/hl";

export const getUserPositions = async ({ query }: { query: Record<string, unknown> }) => {
    const positions = await hl.clearinghouseState({
        user: query.wallet as `0x${string}`,
    })
    console.log(positions.assetPositions[0])
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
export const setAlert = async ({ body, set }: { body: { asset: string, liqPrice: number, address: string }, set: { status: number } }) => {
    const user = await prisma.user.findUnique({
        where: {
            address: body.address,
        },
    })
    if (!user) {
        set.status = 404
        return {
            error: "User not found",
        }
    }
    const alert = await prisma.alert.create({
        data: {
            coin: body.asset,
            liq_price: body.liqPrice,
            user: {
                connect: {
                    address: body.address,
                },
            },
            acknowledged: false,
        }
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