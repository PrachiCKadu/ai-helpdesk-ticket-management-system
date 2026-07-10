// import sgMail from "@sendgrid/mail";
import type { PgBoss } from "pg-boss";
import Sentry from "./sentry";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_EMAIL!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
  family: 4, // force IPv4 — Railway containers don't support outbound IPv6
} as SMTPTransport.Options);

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
     console.log("📥 send-email job received:", jobs[0]?.data);   // 👈 ADD THIS

    const { to, subject, body, bodyHtml } = jobs[0]!.data;

    try {
      // sgMail.setApiKey(process.env.GMAIL_APP_PASSWORD!);

      // await sgMail.send({
      //   to,
      //   from: process.env.GMAIL_EMAIL!,
      //   subject,
      //   text: body,
      //   ...(bodyHtml && { html: bodyHtml }),
      // });

      await transporter.sendMail({
  from: process.env.GMAIL_EMAIL!,
  to,
  subject,
  text: body,
  html: bodyHtml,
});

   console.log(`Email sent to ${to} — subject: "${subject}"`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);   // 👈 ADD THIS LINE
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
