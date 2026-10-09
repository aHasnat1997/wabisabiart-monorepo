
"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getImageUrl } from "../../products/components/getImageUrl";
import Image from "next/image";
import { Paperclip, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";

interface Ticket {
  status: string;
  createdAt: string | Date;
  subject: string;
  message: string;
  attachments?: string[];
}

const TicketDetailModal = ({
  ticket,
  onClose,
}: {
  ticket: Ticket;
  onClose: () => void;
}) => {
  if (!ticket) return null;

  return (
    <Dialog open={!!ticket} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 rounded-2xl border-none shadow-2xl">
        {/* Header — shrink-0 so it never compresses */}
        <DialogHeader className="p-6 border-b bg-muted/20 shrink-0">
          <div className="flex justify-between items-center pr-6">
            <Badge className="bg-chart-2 hover:bg-chart-2 capitalize">
              {ticket.status.toLowerCase()}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar size={12} /> {format(new Date(ticket.createdAt), "PPP")}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold mt-2">
            {ticket.subject}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <ScrollArea className="flex-1 h-0 w-full">
          <div className="p-6 space-y-6">
            <div className="rounded-xl overflow-hidden border bg-card p-4">
              <div
                dangerouslySetInnerHTML={{ __html: ticket.message }}
                className="prose prose-sm max-w-none prose-slate"
              />
            </div>

            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Paperclip size={16} /> Attachments (
                  {ticket.attachments.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ticket.attachments.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative aspect-video rounded-xl overflow-hidden border group cursor-zoom-in shadow-sm"
                    >
                      <Image
                        src={getImageUrl(img)}
                        alt="attachment"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailModal;
