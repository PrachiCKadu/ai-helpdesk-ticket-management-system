import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { agentTicketStatuses, statusLabel } from "core/constants/ticket-status.ts";
import type { TicketFilters } from "./TicketsPage";

const ALL = "__all__";

interface TicketsFiltersProps {
  filters: TicketFilters;
  onChange: (filters: TicketFilters) => void;
}

export default function TicketsFilters({
  filters,
  onChange,
}: TicketsFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.category
  );

  return (
    <div className="flex flex-col gap-3 px-5 py-1 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="group relative flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
        <Input
          placeholder="Search tickets..."
          value={filters.search ?? ""}
          onChange={(e) =>
            onChange({ ...filters, search: e.target.value || undefined })
          }
          className="h-10 rounded-xl border-border/60 bg-background/60 pl-9 text-sm shadow-none transition-colors focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status ?? ALL}
          onValueChange={(value) =>
            onChange({
              ...filters,
              status: value === ALL ? undefined : (value as TicketFilters["status"]),
            })
          }
        >
          <SelectTrigger className="h-10 w-[160px] rounded-xl border-border/60 bg-background/60 text-sm transition-colors hover:border-primary/40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {agentTicketStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category ?? ALL}
          onValueChange={(value) =>
            onChange({
              ...filters,
              category: value === ALL ? undefined : (value as TicketFilters["category"]),
            })
          }
        >
          <SelectTrigger className="h-10 w-[200px] rounded-xl border-border/60 bg-background/60 text-sm transition-colors hover:border-primary/40">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            <SelectItem value="general_question">General question</SelectItem>
            <SelectItem value="technical_question">Technical question</SelectItem>
            <SelectItem value="refund_request">Refund request</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({})}
            className="h-10 gap-1.5 rounded-xl px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}