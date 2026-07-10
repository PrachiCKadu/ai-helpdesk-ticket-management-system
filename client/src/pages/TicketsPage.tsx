import { useState } from "react";
import { Ticket as TicketIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { type TicketStatus } from "core/constants/ticket-status.ts";
import { type TicketCategory } from "core/constants/ticket-category.ts";
import TicketsTable from "./TicketsTable";
import TicketsFilters from "./TicketsFilters";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateTicketDialog from "@/components/CreateTicketDialog";

export interface TicketFilters {
  status?: TicketStatus;
  category?: TicketCategory;
  search?: string;
}

export default function TicketsPage() {
  const [filters, setFilters] = useState<TicketFilters>({});
const [openCreateDialog, setOpenCreateDialog] =
  useState(false);
  return (
    <div className="animate-in-page">
      {/* Header */}
     <div className="mb-8 flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">
      Tickets
    </h1>

    <p className="mt-1 text-sm text-muted-foreground">
      Search, filter and manage every support conversation.
    </p>
  </div>

  <Button onClick={() => setOpenCreateDialog(true)}>
    <Plus className="mr-2 h-4 w-4" />
    Create Ticket
  </Button>
</div>
      {/* Filters */}
      <Card className="mb-4 rounded-2xl border-border/60 bg-card/60 shadow-sm backdrop-blur-xl">
        <CardContent className="p-0">
          <TicketsFilters filters={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden rounded-2xl border-border/60 bg-card/60 shadow-sm backdrop-blur-xl">
        <CardContent className="p-0">
          <TicketsTable filters={filters} />
        </CardContent>
      </Card>

      <CreateTicketDialog
  open={openCreateDialog}
  onOpenChange={setOpenCreateDialog}
/>
    </div>
  );
}