
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Paperclip,  Loader2, Inbox, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { getSupportTickets } from "./SupportAction";
import { Button } from "@/components/ui/button";

interface SupportTicket {
  id: string;
  category: string;
  createdAt: string;
  subject: string;
  priority: "HIGH" | "LOW" | "MEDIUM";
  status: string;
  attachments?: Array<{ name: string }>;
}

const SupportTicketPage = ({ onTicketClick }: { onTicketClick: (ticket: SupportTicket) => void }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // --- STATE FOR TOGGLE ---
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const response = await getSupportTickets();
        if (response && response.success) {
          setTickets(Array.isArray(response.data) ? response.data : []);
        } else {
          setError(response?.message || "Failed to load tickets");
        }
      } catch (err) {
        setError("An unexpected error occurred while fetching tickets.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // --- LOGIC TO SLICE TICKETS ---
  const displayedTickets = showAll ? tickets : tickets.slice(0, 2);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-card rounded-2xl border border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Synchronizing your tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-destructive bg-destructive/5 rounded-2xl border border-destructive/20">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-muted/20 rounded-2xl border border-dashed text-center px-4">
        <Inbox className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <h4 className="font-bold text-foreground">No Tickets Yet</h4>
        <p className="text-sm text-muted-foreground max-w-62.5">
          Your support history is currently empty.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold">Your Support History</h3>
        <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
        </span>
      </div>

      <div className="grid gap-3 transition-all duration-300">
        {displayedTickets.map((ticket) => (
          <Card 
            key={ticket.id} 
            className="p-4 cursor-pointer hover:bg-muted/40 transition-all border-l-4 border-l-chart-2 group relative overflow-hidden shadow-sm"
            onClick={() => onTicketClick(ticket)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="text-primary">{ticket.category.replace(/_/g, " ")}</span>
                  <span>•</span>
                  <span>{format(new Date(ticket.createdAt), "MMM dd, yyyy")}</span>
                </div>

                <h4 className="font-bold text-base group-hover:text-primary transition-colors line-clamp-1 pr-6">
                  {ticket.subject}
                </h4>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock size={14} />
                    <span>{format(new Date(ticket.createdAt), "hh:mm a")}</span>
                  </div>

                  {ticket.attachments && ticket.attachments.length > 0 && (
                    <div className="flex items-center gap-1 text-chart-2 font-bold">
                      <Paperclip size={14} />
                      <span>{ticket.attachments.length} Files</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge 
                  variant={ticket.priority === "HIGH" ? "destructive" : "secondary"}
                  className="text-[9px] px-1.5 h-5 uppercase"
                >
                  {ticket.priority}
                </Badge>
                <div className="text-[10px] font-bold text-muted-foreground/60">
                  {ticket.status}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* --- SHOW MORE / SHOW LESS BUTTON --- */}
      {tickets.length > 2 && (
        <div className="flex justify-center pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAll(!showAll)}
            className="text-primary hover:text-primary hover:bg-primary/5 font-bold text-xs gap-2"
          >
            {showAll ? (
              <>Show Less <ChevronUp size={14} /></>
            ) : (
              <>Show All ({tickets.length - 2} more) <ChevronDown size={14} /></>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SupportTicketPage;