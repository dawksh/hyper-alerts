import prisma from '../lib/prisma'
import logger from '../lib/logger'
import { fetchPrices } from '../lib/hl'
import bot from '../lib/telegram'

let lastPrices: Record<string, number> = {}

const checkAlerts = async () => {
    const prices = await fetchPrices()
    lastPrices = prices
    const alerts = await prisma.alert.findMany({
        where: { acknowledged: false, last_alert: { lt: new Date(Date.now() - 1000 * 60 * 10) } },
        include: { user: true }
    })
    const nearLiq = alerts.filter(a => {
        const price = prices[a.coin]
        if (!price) return false
        return Math.abs(price - a.liq_price) / a.liq_price <= 0.2
    })
    logger.info(`Unacknowledged near-liq alerts: ${nearLiq.length}`)
    nearLiq.forEach(async a => {
        const user = a.user
        if (!user.telegram_id) return
        await prisma.alert.update({
            where: { id: a.id },
            data: { last_alert: new Date() }
        })
        bot.sendMessage(user.telegram_id, `Alert for ${a.coin} at ${a.liq_price}`)
    })
}

setInterval(checkAlerts, 5000)
