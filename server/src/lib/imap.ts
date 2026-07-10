import { ImapFlow } from "imapflow";

import { simpleParser } from "mailparser";

export async function readLatestEmail() {
const client = new ImapFlow({
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

  const lock = await client.getMailboxLock("INBOX");

  try {
   const message = await client.fetchOne("*", {
  source: true,
  envelope: true,
});

if (!message || !message.source) {
  console.log("Inbox is empty.");
  return;
}

const parsed = await simpleParser(message.source);

    console.log("Subject:", parsed.subject);
    console.log("From:", parsed.from?.text);
    console.log("Text:", parsed.text);
  } finally {
    lock.release();
    await client.logout();
  }
}

// export async function testImapConnection() {
//   const client = new ImapFlow({
//     host: "imap.gmail.com",
//     port: 993,
//     secure: true,
//     auth: {
//       user: process.env.GMAIL_EMAIL!,
//       pass: process.env.GMAIL_APP_PASSWORD!,
//     },
//   });

//   try {
//     await client.connect();
//     console.log("✅ Connected to Gmail IMAP");

//     await client.logout();
//     console.log("✅ Disconnected from Gmail");
//   } catch (err) {
//     console.error("❌ IMAP Connection Failed:", err);
//     throw err;
//   }
// }