import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import prisma from "../db";
import { sendClassifyJob } from "./classify-ticket";
import { sendAutoResolveJob } from "./auto-resolve-ticket";
import { createNotification } from "./notifications";

let client: ImapFlow | null = null;

export async function startEmailListener() {
  client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.GMAIL_EMAIL!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
    logger: false,
  });

  await client.connect();

  console.log("📩 Gmail listener connected.");

  await client.mailboxOpen("INBOX");

  console.log("📬 Listening for new emails...");

  client.on("exists", async () => {
    try {
      console.log("📨 New email detected!");

      const message = await client!.fetchOne("*", {
        source: true,
        envelope: true,
      });

      if (!message || !message.source) {
        console.log("No message found.");
        return;
      }

      const parsed = await simpleParser(message.source);

      console.log("Subject:", parsed.subject);
      console.log("From:", parsed.from?.text);
      console.log("Body:", parsed.text);

      function stripSubjectPrefixes(subject: string) {
        return subject.replace(/^(Re:\s*|Fwd:\s*)+/i, "").trim();
      }

      const normalizedSubject = stripSubjectPrefixes(
        parsed.subject || "(No Subject)"
      );

      const senderEmail =
        parsed.from?.value?.[0]?.address || "unknown@example.com";

      const senderName = parsed.from?.value?.[0]?.name || "Unknown";

      const existingTicket = await prisma.ticket.findFirst({
        where: {
          senderEmail,
          subject: {
            equals: normalizedSubject,
            mode: "insensitive",
          },
          status: {
            notIn: ["resolved", "closed"],
          },
        },
      });

      if (existingTicket) {
        await prisma.reply.create({
          data: {
            ticketId: existingTicket.id,
            body: parsed.text || "",
            bodyHtml: parsed.html ? String(parsed.html) : null,
            senderType: "customer",
          },
        });

        console.log(
          "✅ Reply appended to existing ticket",
          existingTicket.id
        );

        const admins = await prisma.user.findMany({
          where: { role: "admin", deletedAt: null },
          select: { id: true },
        });

        await Promise.all(
          admins.map((admin) =>
            createNotification({
              userId: admin.id,
              ticketId: existingTicket.id,
              title: "💬 New Reply",
              message: `${senderName} replied on "${existingTicket.subject}"`,
              type: "ticket_reopened",
            })
          )
        );

        return;
      }

      const ticket = await prisma.ticket.create({
        data: {
          subject: parsed.subject || "(No Subject)",
          body: parsed.text || "",
          bodyHtml: parsed.html ? String(parsed.html) : null,
          senderName,
          senderEmail,
          status: "open",
        },
      });

      console.log("✅ Ticket created in database");

      const admins = await prisma.user.findMany({
        where: { role: "admin", deletedAt: null },
        select: { id: true },
      });

      await Promise.all(
        admins.map((admin) =>
          createNotification({
            userId: admin.id,
            ticketId: ticket.id,
            title: "🎫 New Ticket",
            message: `${ticket.senderName} created "${ticket.subject}"`,
            type: "ticket_created",
          })
        )
      );

      sendClassifyJob(ticket).catch((error) =>
        console.error("Failed to enqueue classify job:", error)
      );

      sendAutoResolveJob(ticket).catch((error) =>
        console.error("Failed to enqueue auto resolve job:", error)
      );
    } catch (err) {
      console.error("Failed to read new email:", err);
    }
  });
}