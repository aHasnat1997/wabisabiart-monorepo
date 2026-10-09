
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    id: "1",
    question: "How do I update my product listings?",
    answer:
      'Go to Products > My Listings and click on the product you want to edit. Make your changes and click "Save".',
  },
  {
    id: "2",
    question: "When do I receive my payments?",
    answer:
      "Payments are processed weekly on Fridays. Funds are released from escrow 3 days after delivery confirmation.",
  },
  {
    id: "3",
    question: "How do I handle refund requests?",
    answer:
      "Refund requests can be managed from the Orders section. Review the request details and approve or reject accordingly.",
  },
  {
    id: "4",
    question: "What are the authenticity requirements?",
    answer:
      "Products must meet our authenticity guidelines. Upload proper documentation where required.",
  },
];

const FAQSection = () => {
  return (
    <Card className="rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-foreground">
            Quick answers to common questions
          </p>
        </div>

        <Button variant="secondary" className="rounded-full">
          View All FAQs
        </Button>
      </div>

      {/* FAQ List */}
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq) => (
          <AccordionItem
            key={faq.id}
            value={faq.id}
            className="border-none rounded-xl bg-muted/50 px-4"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-left">
                  {faq.question}
                </span>
                <HelpCircle className="h-4 w-4 cursor-pointer text-muted-foreground shrink-0" />
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-4 text-sm text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
};

export default FAQSection;
