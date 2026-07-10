import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { validate } from "../lib/validate";
import { parseId } from "../lib/parse-id";
import {
  createTicketSchema,
  ticketListQuerySchema,
  updateTicketSchema,
} from "core/schemas/tickets.ts";
import { sendAutoResolveJob } from "../lib/auto-resolve-ticket";
import { sendEmailJob } from "../lib/send-email";
import prisma from "../db";
import type { Prisma } from "../generated/prisma/client";
import { AI_AGENT_ID } from "core/constants/ai-agent.ts";
import { createNotification } from "../lib/notifications";

interface TicketStatsRow {
  totalTickets: bigint;
  openTickets: bigint;
  resolvedByAI: bigint;
  aiResolutionRate: number;
  avgResolutionTime: number;
}

const router = Router();

router.get("/stats", requireAuth, async (_req, res) => {
  const rows = await prisma.$queryRaw`SELECT * FROM get_ticket_stats(${AI_AGENT_ID})`;
  const row = (rows as TicketStatsRow[])[0]!;

  res.json({
    totalTickets: Number(row.totalTickets),
    openTickets: Number(row.openTickets),
    resolvedByAI: Number(row.resolvedByAI),
    aiResolutionRate: row.aiResolutionRate,
    avgResolutionTime: row.avgResolutionTime,
  });
});

router.get("/stats/daily-volume", requireAuth, async (_req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const tickets = await prisma.ticket.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  });

  const countsByDate = new Map<string, number>();
  for (const t of tickets) {
    const dateKey = t.createdAt.toISOString().slice(0, 10);
    countsByDate.set(dateKey, (countsByDate.get(dateKey) ?? 0) + 1);
  }

  const data: { date: string; tickets: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const dateKey = d.toISOString().slice(0, 10);
    data.push({ date: dateKey, tickets: countsByDate.get(dateKey) ?? 0 });
  }

  res.json({ data });
});

router.post("/", requireAuth, async (req, res) => {
  const data = validate(createTicketSchema, req.body, res);

  if (!data) return;

  const ticket = await prisma.ticket.create({
    data: {
      subject: data.subject,
      body: data.body,
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      category: data.category ?? null,
      status: "open",
      assignedToId: null,
    },
  });

  const admins = await prisma.user.findMany({
    where: {
      role: "admin",
      deletedAt: null,
    },
    select: {
      id: true,
    },
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

  // Send acknowledgement email
  await sendEmailJob({
    to: ticket.senderEmail,
    subject: `Ticket Created: ${ticket.subject}`,
    body: `Hi ${ticket.senderName},

Your have received your enquiry related to ${ticket.subject}.
We are currently reviewing your ticket and will get back to you as soon as possible.

Our support team will contact you shortly.

Thank you.`,
  });

  // Trigger AI
  await sendAutoResolveJob({
    id: ticket.id,
    subject: ticket.subject,
    body: ticket.body,
    senderName: ticket.senderName,
    senderEmail: ticket.senderEmail,
  });

  res.status(201).json(ticket);
});

router.get("/", requireAuth, async (req, res) => {
  const query = validate(ticketListQuerySchema, req.query, res);
  if (!query) return;

  const where: Prisma.TicketWhereInput = {};

  if (query.status) {
    where.status = query.status;
  } else {
    where.status = { in: ["open", "resolved", "closed"] };
  }

  if (query.category) {
    where.category = query.category;
  }

  if (query.search) {
    where.OR = [
      { subject: { contains: query.search, mode: "insensitive" } },
      { senderName: { contains: query.search, mode: "insensitive" } },
      { senderEmail: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      select: {
        id: true,
        subject: true,
        status: true,
        category: true,
        senderName: true,
        senderEmail: true,
        createdAt: true,
      },
      where,
      orderBy: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.ticket.count({ where }),
  ]);

  res.json({ tickets, total, page: query.page, pageSize: query.pageSize });
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true } },
    },
  });

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  res.json(ticket);
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const data = validate(updateTicketSchema, req.body, res);
  if (!data) return;

  if (data.assignedToId) {
    const user = await prisma.user.findUnique({
      where: { id: data.assignedToId, deletedAt: null },
    });
    if (!user) {
      res.status(400).json({ error: "Invalid agent" });
      return;
    }
  }

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      ...("assignedToId" in data && { assignedToId: data.assignedToId }),
      ...("status" in data && { status: data.status }),
      ...("category" in data && { category: data.category }),
    },
    include: { assignedTo: { select: { id: true, name: true } } },
  });

  res.json(updated);
});

router.delete("/:id", requireAuth, async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const id = parseId(req.params.id);

  if (!id) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
  });

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  await prisma.ticket.delete({
    where: { id },
  });

  res.status(204).send();
});

export default router;