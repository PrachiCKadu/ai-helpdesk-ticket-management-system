import { useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ticketCategories,
  categoryLabel,
} from "core/constants/ticket-category";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTicketDialog({
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient();

  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>("");

    const createTicketMutation = useMutation({
    mutationFn: async () => {
      await axios.post("/api/tickets", {
        senderName,
        senderEmail,
        subject,
        body,
        category: category || undefined,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });

      setSenderName("");
      setSenderEmail("");
      setSubject("");
      setBody("");
      setCategory("");

      onOpenChange(false);
    },
  });

  const handleSubmit = () => {
    createTicketMutation.mutate();
  };

    return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl border-border/60 bg-card p-0">
        <DialogHeader className="border-b border-border/60 px-6 py-5">
          <DialogTitle className="text-xl">
            Create Ticket
          </DialogTitle>

          <DialogDescription>
            Create a support ticket on behalf of a customer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          {/* Customer */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Customer Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>

                <Input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>

                <Input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>

          {/* Ticket */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Ticket Details
            </h3>

            <div className="space-y-2">
              <Label>Subject</Label>

              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Unable to login"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>

              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent>
                  {ticketCategories.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                    >
                      {categoryLabel[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>

              <Textarea
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Describe the customer's issue..."
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={createTicketMutation.isPending}
          >
            {createTicketMutation.isPending
              ? "Creating..."
              : "Create Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}