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

export default client 
