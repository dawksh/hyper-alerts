import axios from "axios";
import { env } from "./env";

const BASE_URL = "https://api.copperx.io/api/v1"

export const createCopperxUser = (
  email: string,
  name: string,
  metadata: Record<string, string>
) =>
  axios
    .post(
      `${BASE_URL}/customers`,
      { email, name, metadata },
      {
        headers: { Authorization: `Bearer ${env.COPPERX_API_KEY}` },
      }
    )
    .then((r) => r.data);
