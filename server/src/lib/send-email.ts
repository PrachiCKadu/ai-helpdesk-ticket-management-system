import type { PgBoss } from "pg-boss";
import Sentry from "./sentry";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

const QUEUE_NAME = "send-email";

interface SendEmailJobData {
  to: string;
  subject: string;
  body: string;
  bodyHtml?: string;
}

export async function registerSendEmailWorker(boss: PgBoss): Promise<void> {
  await boss.createQueue(QUEUE_NAME, {
    retryLimit: 3,
    retryDelay: 30,
    retryBackoff: true,
  });

  await boss.work<SendEmailJobData>(QUEUE_NAME, async (jobs) => {
    const { to, subject, body, bodyHtml } = jobs[0]!.data;

    try {
      const { error } = await resend.emails.send({
        from: "Helpdesk <onboarding@resend.dev>", // swap once your domain is verified
        to,
        subject,
        text: body,
        ...(bodyHtml && { html: bodyHtml }),
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log(`Email sent to ${to} — subject: "${subject}"`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      Sentry.captureException(error, {
        tags: { queue: QUEUE_NAME },
      });
      throw error;
    }
  });
}

export async function sendEmailJob(data: SendEmailJobData): Promise<void> {
  const { boss } = await import("./queue");
  await boss.send(QUEUE_NAME, data);
}