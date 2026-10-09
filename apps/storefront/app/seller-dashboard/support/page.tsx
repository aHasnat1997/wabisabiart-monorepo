/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { History, Mail, MessageSquareDot, Newspaper, PanelBottom, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import SupportCard from "./components/SupportCard";
import HelpCard from "./components/HelpCard";
import FAQSection from "./components/FAQs";
import TicketForm from "./components/TicketForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendSupportEmail } from "./components/SupportAction";
import SectionTitle from "@/components/SectionTitle";
import SupportTicketPage from "./components/SupportTicketPage";
import TicketDetailModal from "./components/TicketDetailModal";
import { SupportCardItem, SupportEmailRequest } from "@/types/sellerDashboard/Support";
import { Button } from "@/components/animate-ui/primitives/buttons/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";

const Support = () => {
  const [isSending, setIsSending] = useState<boolean>(false);
  
  // --- NEW STATE FOR MODAL ---
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const handleQuickSupport = async () => {
    setIsSending(true);

    const htmlMessage = `
      <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #2563eb;">Quick Support Request</h2>
        <p>Hello Support Team,</p>
        <p>I am reaching out from my <b>Seller Dashboard</b> because I need assistance with my account.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 0.875rem; color: #666;">
          Sent from Atque Marketplace Seller Dashboard
        </p>
      </div>
    `;

    const emailData: SupportEmailRequest = {
      subject: "Urgent: Seller Account Assistance",
      message: htmlMessage,
    };

    const result = await sendSupportEmail(emailData);

    if (result?.success) {
      toast.success(result.data || result.message);
    } else {
      toast.error(result?.message || "Failed to send request.");
    }

    setIsSending(false);
  };

  const supportCard: SupportCardItem[] = [
    {
      id: 1,
      title: "Email Support",
      value: "Professional API Support",
      icon: <Mail className="w-6 h-6" />,
      color: "bg-chart-4/65 text-card",
      textColor: "bg-muted text-muted-foreground",
      button: {
        label: isSending ? "Sending..." : "Send Email",
        onClick: handleQuickSupport,
        variant: "default",
      },
    },
    {
      id: 2,
      title: "Last Verified",
      value: "Jan 2, 2025",
      icon: <Phone className="w-6 h-6" />,
      color: "bg-chart-1/65 text-card",
      textColor: "bg-muted text-chart-1",
      button: {
        label: "Call Now",
        onClick: () => {
          window.open("tel:+880123456789");
        },
      },
    },
    {
      id: 3,
      title: "Next Review",
      value: "Jul 14, 2025",
      icon: <MessageSquareDot className="w-6 h-6" />,
      color: "bg-chart-6/65 text-card",
      textColor: "bg-muted text-chart-2",
      button: {
        label: "Message",
        onClick: () => {
          console.log("Open message modal");
        },
        variant: "secondary",
      },
    },
  ];

  const helpResourceCard: SupportCardItem[] = [
    {
      id: 1,
      title: "Seller Handbook",
      value: "complete guide to selling on the platform",
      icon: <PanelBottom className="w-6 h-6" />,
      color: "bg-chart-4/65 text-card",
      textColor: "bg-muted text-muted-foreground",
    },
    {
      id: 2,
      title: "Policy Documents",
      value: "team policy & seller policies",
      icon: <Newspaper className="w-6 h-6" />,
      color: "bg-chart-1/65 text-card",
      textColor: "bg-muted text-chart-1",
    },
    {
      id: 3,
      title: "Community Form",
      value: "contact with other seller",
      icon: <MessageSquareDot className="w-6 h-6" />,
      color: "bg-chart-6/65 text-card",
      textColor: "bg-muted text-chart-2",
    },
  ];

  return (
    <div className="flex flex-col min-h-0 space-y-6">
      {/* Header text */}
      <div className="mb-6">
        <SectionTitle title="Help & Support" subtitle="Get help and find answers to your questions" />
      </div>

      {/* Support Cards */}
      <SupportCard data={supportCard} />

      {/* Help Resource */}
      <div className="p-4 bg-card rounded-2xl">
        <HelpCard data={helpResourceCard} />
      </div>

      {/* FAQ Section */}
      <div>
        <FAQSection />
      </div>

      {/* --- NEW SECTION: TICKET HISTORY --- */}
    

      {/* TicketForm */}
     <div className="flex-1 min-h-0 overflow-hidden pt-6 border-t">
  <div className="flex justify-between items-center mb-6">
    <SectionTitle title="Submit New Ticket" subtitle="Send us a detailed message about your issue" />
    
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="flex items-center gap-2 rounded-full px-5 cursor-pointer py-2 h-10 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 border border-primary/20 mr-2 md:mr-8 shadow-sm"
        >
          <History size={16} />
          <span className="font-bold text-xs uppercase tracking-wider">Ticket History</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 rounded-2xl overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 border-b bg-muted/20 shrink-0"> {/* shrink-0 keeps the header from compressing */}
          <DialogTitle className="text-xl font-bold">Support History</DialogTitle>
        </DialogHeader>

        {/* 1. We use flex-grow to take up all space. 
            2. We set overflow-hidden on this container. 
        */}
        <div className="grow overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="p-6"> {/* Padding goes inside the scrollable content */}
              <SupportTicketPage onTicketClick={(ticket) => setSelectedTicket(ticket)} />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  </div>

  <ScrollArea className=" mt-4"> {/* Ensure this has a height too */}
    <div className="p-0">
      <TicketForm />
    </div>
  </ScrollArea>
</div>
     

      {/* --- HIDDEN MODAL COMPONENT --- */}
<div >
      
  <TicketDetailModal 
    ticket={selectedTicket} 
    onClose={() => setSelectedTicket(null)} 
  />

</div>
    </div>
  );
};

export default Support;