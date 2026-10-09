import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/animate-ui/components/radix/accordionCopy";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HelpPage() {
  return (
    <div>
      <section className="text-card rounded-xl md:rounded-2xl max-w-5xl mx-auto bg-linear-to-b from-[#799D02] to-[#567100] px-8 py-16 text-center">
        <p className="uppercase text-card/75 mb-2">Legal</p>
        <h3 className="text-4xl font-bold text-card">Help</h3>
        <p className="text-card/75 mt-4 max-w-2xl mx-auto leading-relaxed">
          Find answers to common questions about our products, orders, and
          services. If you need further assistance, our support team is here to
          help.
        </p>
      </section>
      <div className="max-w-5xl mt-8 md:mt-16 w-full mx-auto ">
        <div className="space-y-6 md:space-y-10">
          {faqs?.categories?.map((faq, i) => (
            <div key={i}>
              <h2 className="text-xl md:text-2xl font-semibold mb-3">
                {faq.name}
              </h2>

              <Accordion
                type="single"
                collapsible
                className="space-y-2 md:space-y-4 bg-sidebar-background rounded-xl md:rounded-2xl px-4 py-6 md:py-8 md:px-6 border border-border/25 shadow"
              >
                {faq.questions.map((q, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`item-${i}-${idx}`}
                    className="border-b border-border/25"
                  >
                    <AccordionTrigger>{q.question}</AccordionTrigger>

                    <AccordionContent className="text-muted-foreground p-2.5 md:p-4 rounded-lg md:rounded-2xl bg-card">
                      {q.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
        <div className="mt-16 bg-sidebar-background rounded-xl text-foreground p-8 md:p-12 text-center space-y-2">
          <div className="text-center">
            <h2 className="text-2xl text-muted-foreground font-semibold">
              Still have questions?
            </h2>
            <p className="text-foreground py-3">
              Our team usually replies within a few hours.
            </p>
          </div>
          <Link href="/contact">
            <Button
              variant={"ghost"}
              className="bg-foreground text-card rounded-full px-8 h-11 uppercase text-base hover:bg-foreground/90 hover:scale-103 duration-300 hover:shadow-lg font-medium inline-block"
            >
              Contact us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const faqs = {
  categories: [
    {
      name: "Orders & Shipping",
      questions: [
        {
          question: "How long does shipping take?",
          answer:
            "Shipping times vary depending on the seller and destination. Estimated delivery dates are displayed on each product page during checkout.",
        },
        {
          question: "Can I track my order?",
          answer:
            "Yes. Once your order is shipped, tracking information will be available in your account and sent to your email.",
        },
        {
          question: "Do you offer international shipping?",
          answer:
            "Many sellers offer international shipping. Availability and shipping costs are shown on the product page.",
        },
      ],
    },
    {
      name: "Payments & Refunds",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept major credit and debit cards, along with other secure payment methods available at checkout.",
        },
        {
          question: "Can I request a refund?",
          answer:
            "Refund eligibility depends on the seller's policy and the nature of the product. Please review the seller's terms before purchasing.",
        },
        {
          question: "Is my payment information secure?",
          answer:
            "Yes. All payments are processed through secure payment gateways with industry-standard encryption.",
        },
      ],
    },
    {
      name: "Custom Orders & Commissions",
      questions: [
        {
          question: "How do custom orders work?",
          answer:
            "You can submit customization details when placing an order. The seller will review your request before production begins.",
        },
        {
          question: "Can I request changes after ordering?",
          answer:
            "Changes may be possible if production has not started. Contact the seller as soon as possible to discuss modifications.",
        },
        {
          question: "How do commission requests work?",
          answer:
            "For commission-based services, you submit a request and the seller can accept, reject, or discuss details before work begins.",
        },
      ],
    },
    {
      name: "Account & Sellers",
      questions: [
        {
          question: "How do I create an account?",
          answer:
            "Click the Sign Up button and follow the registration process using your email address.",
        },
        {
          question: "How can I become a seller?",
          answer:
            "You can apply to become a seller through the seller registration page and complete the required profile information.",
        },
        {
          question: "Can I manage multiple products?",
          answer:
            "Yes. Sellers can create, edit, and manage multiple listings from their seller dashboard.",
        },
      ],
    },
  ],
};
