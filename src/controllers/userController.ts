import prisma from "../lib/prisma";
import hl from "../lib/hl";

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
        }
    })
}
export const setAlert = async ({ body }: { body: { asset: string, liqPrice: number, address: string } }) => {
    await prisma.alert.create({
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
export const addUser = async ({ body }: { body: unknown }) => ({}) 