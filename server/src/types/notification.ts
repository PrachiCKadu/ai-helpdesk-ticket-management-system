export interface Notification {
  id: number;
  title: string;
  message: string;
  type:
    | "ticket_created"
    | "ticket_assigned"
    | "ticket_reopened"
    | "ticket_closed"
    | "ai_summary"
    | "ai_reply"
    | "ai_failed";

  isRead: boolean;

  createdAt: string;

  ticket?: {
    id: number;
    subject: string;
  };
}