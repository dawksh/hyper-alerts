import logger from "../lib/logger";

export const getUserPositions = async ({ query }: { query: Record<string, unknown> }) => {
    logger.info(query)
    return []
}
export const setAlert = async ({ body }: { body: unknown }) => ({})
export const addUser = async ({ body }: { body: unknown }) => ({}) 