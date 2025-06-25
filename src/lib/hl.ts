import {
    HttpTransport,
    InfoClient,
} from "@nktkas/hyperliquid"
import { env } from "./env"

const transport = new HttpTransport({
    isTestnet: env.ENV === 'development',
})

const client = new InfoClient({
    transport
})

export const fetchPrices = async (): Promise<Record<string, number>> => {
    const prices = await client.metaAndAssetCtxs()
    if (!prices?.[0]?.universe || !prices?.[1]) return {}
    return Object.fromEntries(prices[0].universe.map((u, i) => [u.name, Number(prices[1][i]?.markPx)]))
}

export default client 
