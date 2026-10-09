import Footer from "@/components/shared/footer";
import Nav from "@/components/shared/Navbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ScrollArea className="h-screen w-full">
      <section className="bg-card">
        <Nav />
        <div className="section-container px-2">{children}</div>
        <Footer />
      </section>
    </ScrollArea>
  );
}
