import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { parseId } from "../lib/parse-id";
import prisma from "../db";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  res.json(notifications);
});

// Mark a single notification as read
router.patch("/:id/read", requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid notification ID" });
    return;
  }

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification || notification.userId !== req.user.id) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  res.json(updated);
});

// Mark all of the current user's notifications as read
router.patch("/read-all", requireAuth, async (req, res) => {
  await prisma.notification.updateMany({
    where: {
      userId: req.user.id,
      isRead: false,
    },
    data: { isRead: true },
  });

  res.json({ success: true });
});

export default router;