import { Mail, MessageCircle, Clock } from "lucide-react";
import ContactForm from "../components/ContactForm";
import { adminContactInfo } from "../components/action";

export default async function ContactPage() {
  const contactInfo = await adminContactInfo();
  const pageData = {
    contact_info: [
      {
        icon: "email",
        label: "Email",
        value: contactInfo?.email,
        note: "We'll respond as soon as possible.",
      },
      {
        icon: "chat",
        label: "Live Chat",
        value: contactInfo?.availableWeekRange,
        note: contactInfo?.availableTimeRange,
      },
      {
        icon: "clock",
        label: "Response Time",
        value: contactInfo?.responseTime,
        note: "During business hours.",
      },
    ],
  };
  return (
    <div className="bg-extra2/10 -mb-16 min-h-screen">
      <section className="text-card rounded-xl md:rounded-2xl bg-linear-to-b from-[#799D02] to-[#567100] px-8 py-16 text-center">
        <h3 className="text-4xl font-bold text-card">Contact Us</h3>
        <p className="text-card/75 mt-4 max-w-2xl mx-auto leading-relaxed">
          Questions about an order, product, or custom request? Our team is here
          to help.
        </p>
      </section>

      <div className="section-container pt-16 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Contact Info */}
          <div className="flex flex-col lg:sticky lg:top-4 gap-4">
            {pageData.contact_info.map((card) => (
              <div
                key={card.label}
                className="bg-background/50 border border-border/25 rounded-2xl p-5 flex items-start gap-4 shadow hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  {card.icon === "email" ? (
                    <Mail className="w-5 h-5 text-card" />
                  ) : card.icon === "chat" ? (
                    <MessageCircle className="w-5 h-5 text-card" />
                  ) : (
                    <Clock className="w-5 h-5 text-card" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                    {card.label}
                  </p>
                  <p className="font-medium text-foreground leading-snug">
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{card.note}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Client Form */}
          <div className="md:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
