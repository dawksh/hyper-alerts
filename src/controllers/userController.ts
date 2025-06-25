import logger from "../lib/logger";
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
export const setAlert = async ({ body }: { body: unknown }) => ({})
export const addUser = async ({ body }: { body: unknown }) => ({}) 