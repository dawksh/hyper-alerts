import prisma from '../lib/prisma'
import logger from '../lib/logger'
import { fetchPrices } from '../lib/hl'

let lastPrices: Record<string, number> = {}

const checkAlerts = async () => {
    const prices = await fetchPrices()
    lastPrices = prices
    const alerts = await prisma.alert.findMany({
        where: { acknowledged: false }
    })
    const nearLiq = alerts.filter(a => {
        const price = prices[a.coin]
        if (!price) return false
        if (a.direction === "long") {
            return price <= a.liq_price * 1.2
        } else {
            return price >= a.liq_price * 0.8
        }
    })
    logger.info(`Unacknowledged near-liq alerts: ${nearLiq.length}`)
}

setInterval(checkAlerts, 1000)
