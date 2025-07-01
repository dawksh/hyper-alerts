import twilio from "twilio";
import { env } from "./env";

const client = twilio(env.TWILIO_SID, env.TWILIO_AUTH_TOKEN);

export const sendMessage = async (
    to: string,
    body: string,
    alertId: string
) => {
    await client.calls.create({
        to,
        from: env.TWILIO_PHONE_NUMBER,
        twiml: `
        <Response>
  <Pause length="2"/>
  <Say>${body}</Say>
  <Say>Press 1 to acknowledge this alert.</Say>
  <Gather numDigits="1" action="https://hyper-alerts-production.up.railway.app/twilio/handle/${alertId}" timeout="30">
    <Say>Press 1 to acknowledge</Say>
  </Gather>
  <Say>No response received. Goodbye.</Say>
  <Hangup/>
</Response>
        `,
    });
};
