import prisma from "../db";
import { NotificationType } from "../generated/prisma/client";

interface CreateNotificationInput {
  userId: string;
  ticketId?: number;
  title: string;
  message: string;
  type: NotificationType;
}

export async function createNotification(
  data: CreateNotificationInput
) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      ticketId: data.ticketId,
      title: data.title,
      message: data.message,
      type: data.type,
    },
  });
}