import { apiFetch } from "@/lib/apiFetch";
import { SupportEmailRequest, SupportEmailResponse, SupportTicketRequest } from "@/types/sellerDashboard/Support";




export const sendSupportEmail = async (data: SupportEmailRequest): Promise<SupportEmailResponse | null> => {
  try {
    const response = await apiFetch<SupportEmailResponse>("/support/seller/email", {      
      method: "POST",
      body: data, 
    });
    return response;           
  } catch (error) {
    console.error("Email Send Error:", error);
    return null;
  }       
}

export const supportTickets = async (data: SupportTicketRequest): Promise<SupportEmailResponse | null> => {
    try {
        const response = await apiFetch<SupportEmailResponse>("/support/seller/tickets", {
            method: "POST",
            body: data,
        });
        return response;
        
    } catch (error) {
        console.error("Support Tickets Fetch Error:", error);
        return null;
    }
}


export const getSupportTickets = async (): Promise<SupportEmailResponse | null> => {
    try {
        const response = await apiFetch<SupportEmailResponse>("/support/seller/tickets", {
            method: "GET",
        });
        return response;
    } catch (error) {
        console.error("Support Tickets Fetch Error:", error);
        return null;
    }
}

export const getSupportTicketById = async (ticketId: string): Promise<SupportEmailResponse | null> => {
    try {
        const response = await apiFetch<SupportEmailResponse>(`/support/seller/tickets/${ticketId}`, {
            method: "GET",
        });
        return response;
    } catch (error) {
        console.error("Support Ticket Detail Fetch Error:", error);
        return null;
    } 
}