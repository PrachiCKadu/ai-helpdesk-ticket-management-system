import DOMPurify from "dompurify";
import { type Ticket } from "core/constants/ticket.ts";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { Calendar, Clock, Mail } from "lucide-react";

interface TicketDetailProps {
  ticket: Ticket;
}

function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

export default function TicketDetail({ ticket }: TicketDetailProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm backdrop-blur-xl">
        <div className="mb-4 flex items-start gap-3">
          <h1 className="flex-1 text-2xl font-bold tracking-tight">
            {ticket.subject}
          </h1>
          <StatusBadge status={ticket.status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {/* Sender */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-xs font-semibold text-primary-foreground">
              {initialsOf(ticket.senderName)}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium">{ticket.senderName}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                {ticket.senderEmail}
              </p>
            </div>
          </div>

          <div className="hidden h-8 w-px bg-border/60 sm:block" />

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Created {new Date(ticket.createdAt).toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Updated {new Date(ticket.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <Card className="rounded-2xl border-border/60 bg-card/60 shadow-sm backdrop-blur-xl">
        <CardContent className="p-6">
          {ticket.bodyHtml ? (
            <div
              className="max-w-none text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_p]:mb-3 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(ticket.bodyHtml),
              }}
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {ticket.body}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}