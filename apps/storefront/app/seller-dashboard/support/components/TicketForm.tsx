/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, CheckCircle2 } from "lucide-react";
import { supportTicketApiSchema, SupportTicketFormValues } from "./supportTicketSchema";
import { useState } from "react";
import Image from "next/image";
import { SupportTicketRequest, TicketCategory, TicketPriority } from "@/types/sellerDashboard/Support";
import { supportTickets } from "./SupportAction";
import { toast } from "sonner";
import { useFileUpload } from "@/components/uploadFile";
import { getImageUrl } from "../../products/components/getImageUrl";

const TicketForm = () => {
 const [isSending, setIsSending] = useState(false);

  const {
    uploadedFiles,
    localPreviews,
    handleUpload,
    handleRemove,
    isUploading,
    reset: resetUploads,
  } = useFileUpload({ multiple: true });

  const {
    register,
    handleSubmit,
    setValue,
    reset: resetForm,
    formState: { errors },

  } = useForm<SupportTicketFormValues>({
    resolver: zodResolver(supportTicketApiSchema),
    defaultValues: { priority: "low" },
  });

  const onSubmit = async (values: SupportTicketFormValues) => {
    if (isUploading) return toast.error("Please wait for images to finish uploading");
    setIsSending(true);

    const attachmentUrls = uploadedFiles.map((f) => f.url);

    const htmlMessage = `
      <div style="font-family:sans-serif;border:1px solid #e2e8f0;border-radius:8px;padding:12px">
        <h3 style="color:#1e293b;margin:0 0 10px">Subject: ${values.subject}</h3>
        <p style="margin:0 0 5px"><strong>Priority:</strong> ${values.priority.toUpperCase()}</p>
        <p style="margin:0 0 10px"><strong>Category:</strong> ${values.category}</p>
        <div style="color:#334155;line-height:1.5;border-top:1px solid #eee;padding-top:10px">
          ${values.message.replace(/\n/g, '<br/>')}
        </div>
      </div>
    `;

    const finalPayload: SupportTicketRequest = {
      subject: values.subject,
      category: values.category as TicketCategory,
      priority: values.priority.toUpperCase() as TicketPriority,
      message: htmlMessage,
      attachments: attachmentUrls,
    };

    try {
      const response = await supportTickets(finalPayload);
      if (response?.success) {
        toast.success(response.message || "Ticket submitted successfully");
        resetForm();
        resetUploads();
      }
    } catch (error: any) {
      toast.error("Submission failed");
    } finally {
      setIsSending(false);
    }
  };

  

  return (
    <Card className="p-6 rounded-2xl shadow-sm border">
      <h2 className="text-lg font-semibold mb-6">Submit a Support Ticket</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
       
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input placeholder="What is the issue?" {...register("subject")} className="h-11! bg-background border-0 rounded-lg" />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select onValueChange={(value) => setValue("category", value)}>
            <SelectTrigger className="h-11! bg-background border-0  w-full rounded-lg"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BILLING_PAYMENTS">Billing & Payments</SelectItem>
              <SelectItem value="TECHNICAL_ERROR_BUG">Technical Error/Bug</SelectItem>
              <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
              <SelectItem value="ACCOUNT_LOGIN">Account Login</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <RadioGroup defaultValue="low" onValueChange={(v) => setValue("priority", v as any)} className="flex gap-4">
            {["low", "medium", "high"].map((item) => (
              <Label key={item} className="flex items-center gap-2 border p-3 w-full rounded-xl cursor-pointer hover:bg-muted/50 transition-all capitalize">
                <RadioGroupItem value={item} /> {item}
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea rows={5} placeholder="Describe your problem..." {...register("message")} className="bg-background border-0 rounded-lg resize-none" />
        </div>

        {/* --- ATTACHMENT SECTION --- */}
    <div className="space-y-3">
  <Label className="text-sm font-bold">Attachments</Label>
  <div className="bg-background rounded-xl p-5 border-2 border-dashed min-h-50 flex items-center justify-center">
    
    {localPreviews.length > 0 || uploadedFiles.length > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full items-start">
      
        {/* 1. LOCAL PREVIEWS (While uploading) */}
        {localPreviews.map((url, idx) => (
          <div key={`local-${idx}`} className="relative aspect-video w-full">
            <div className="w-full h-full rounded-xl overflow-hidden bg-card border-2 opacity-50 relative">
              <Image 
                src={getImageUrl(url)} 
                alt="loading" 
                fill 
                className="object-cover" 
                unoptimized={true} 
              />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 rounded-xl">
               <Loader2 className="size-6 text-primary animate-spin" />
               <span className="text-[10px] font-bold mt-1 text-primary">UPLOADING</span>
            </div>
          </div>
        ))}

        {/* 2. UPLOADED FILES (Success State) */}
        {uploadedFiles.map((file) => (
          <div key={file.key} className="flex flex-col items-center gap-1.5 w-full">
            <div className="relative w-full aspect-video group">
              <div className="w-full h-full rounded-xl overflow-hidden bg-card border-2 border-chart-2/30 shadow-sm relative">
                <Image 
                    src={getImageUrl(file.url)} 
                    alt="Attachment" 
                    fill 
                    className="object-cover" 
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(file.key)}
                className="absolute -top-2 -right-2 w-7 h-7 bg-destructive text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-[10px] text-chart-2 font-bold flex items-center gap-1">
               <CheckCircle2 size={10} /> READY
            </p>
          </div>
        ))}

        {/* 3. Upload More Button - Matches the grid size */}
        <label className="flex flex-col items-center justify-center aspect-video rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/60 border-2 border-transparent transition-all group border-dashed hover:border-primary/50">
           <Upload size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
           <span className="text-[10px] mt-1 font-bold text-muted-foreground uppercase">Add More</span>
           <input 
             type="file" 
             multiple 
             className="hidden" 
             onChange={handleUpload} 
             accept="image/*" 
           />
        </label>
      </div>
    ) : (
      /* EMPTY STATE */
      <label className="cursor-pointer w-full flex flex-col items-center justify-center py-10 space-y-3 group hover:bg-muted/20 transition-colors">
        <div className="bg-muted p-4 rounded-full group-hover:bg-primary/10 transition-colors">
          <Upload className="size-8 text-muted-foreground group-hover:text-primary" />
        </div>
        <div className="text-center">
          <p className="font-bold text-foreground">Click to upload attachments</p>
          <p className="text-xs text-muted-foreground">PNG, JPG or JPEG up to 5MB</p>
        </div>
        <input 
          type="file" 
          multiple 
          className="hidden" 
          onChange={handleUpload} 
          accept="image/*" 
        />
      </label>
    )}
  </div>
</div>

        <Button type="submit" disabled={isSending || isUploading} className="w-full h-12 rounded-full font-bold shadow-md">
          {isSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : "Submit Ticket"}
        </Button>
      </form>
    </Card>
  );
};

export default TicketForm;