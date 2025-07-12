import prisma from "../lib/prisma";
import hl, { fetchPrices } from "../lib/hl";
import type { Direction } from "../lib/constants";
import { createCopperxUser } from "../lib/copperx";

export const getUserPositions = async ({
  query,
}: {
  query: Record<string, unknown>;
}) => {
  const positions = await hl.clearinghouseState({
    user: query.wallet as `0x${string}`,
  });
  const prices = await fetchPrices();
  return positions.assetPositions.map(({ position }) => {
    return {
      asset: position.coin,
      size: position.szi,
      markPrice: prices[position.coin],
      entryPrice: position.entryPx,
      collateral: position.marginUsed,
      liquidationPrice: position.liquidationPx,
      leverage: position.leverage,
      direction:
        position.entryPx > (position.liquidationPx ?? 0) ? "long" : "short",
    };
  });
};
export const setAlert = async ({
  body,
  set,
}: {
  body: {
    alerts: {
      asset: string;
      liqPrice: string;
      address: string;
      direction: Direction;
      size: string;
      margin: string;
      leverage: string;
    }[];
  };
  set: { status: number };
}) => {
  const user = await prisma.user.findUnique({
    where: {
      address: body?.alerts?.[0]?.address,
    },
  });
  if (!user) {
    set.status = 404;
    return {
      error: "User not found",
    };
  }
  const alert = await prisma.alert.createMany({
    data: body.alerts.map(
      ({ asset, liqPrice, address, direction, size, margin, leverage }) => ({
        coin: asset,
        liq_price: Number(liqPrice),
        acknowledged: false,
        direction: direction,
        user_address: address,
        last_alert: null,
        size: Number(size),
        margin: Number(margin),
        last_price: null,
        leverage: Number(leverage),
      })
    ),
  });
  return alert;
};
export const acknowledgeAlert = async ({
  body,
  set,
}: {
  body: { alert: string };
  set: { status: number };
}) => {
  const alert = await prisma.alert.updateMany({
    where: { id: body.alert },
    data: { acknowledged: true },
  });
  if (alert.count != 1) {
    set.status = 400;
    return { error: "not all alerts acknowledged" };
  }
  return alert;
};
export const updateUser = async ({
  body,
}: {
  body: {
    id: string;
    pd_id?: string;
    telegram_id?: string;
    email?: string;
    threshold?: number;
  };
}) => {
  let stripe_id: string | null = null;

  const user = await prisma.user.findUnique({
    where: { id: body.id },
  });
  if (!user) {
    return { error: "User not found" };
  }

  if (body.email) {
    const customer = await createCopperxUser(body.email, body.email, {
      address: user.address,
    });
    stripe_id = customer.id;
    await prisma.user.update({
      where: { id: body.id },
      data: {
        pd_id: body.pd_id,
        telegram_id: body.telegram_id,
        email: body.email,
        threshold: body.threshold,
        stripe_id: stripe_id,
      },
    });
    return user;
  }
  await prisma.user.update({
    where: { id: body.id },
    data: {
      pd_id: body.pd_id,
      telegram_id: body.telegram_id,
      email: body.email,
      threshold: body.threshold,
    },
  });
  return user;
};

export const getAlerts = async ({
  query,
}: {
  query: Record<string, unknown>;
}) => {
  if (query.wallet) {
    const alerts = await prisma.alert.findMany({
      where: {
        user: {
          address: query.wallet as `0x${string}`,
        },
      },
    });
    return alerts;
  }

  const alerts = await prisma.alert.findMany({
    where: {
        acknowledged: true
    },
  });
  return alerts;
};

export const getUser = async ({
  query,
}: {
  query: Record<string, unknown>;
}) => {
  const user = await prisma.user.findUnique({
    where: { address: query.wallet as `0x${string}` },
    include: {
      credits: true,
      payments: true,
    },
  });
  if (!user) {
    const newUser = await prisma.user.create({
      data: {
        address: query.wallet as `0x${string}`,
        pd_id: null,
        email: null,
      },
      include: {
        credits: true,
        payments: true,
      },
    });
    await prisma.credits.create({
      data: {
        user_id: newUser.id,
        credits: 3,
      },
    });
    return newUser;
  }
  return user;
};
