import Link from "next/link";
import Image from "next/image";
import logImg from "@/assets/images/Logo.png";

export default function Footer() {
  return (
    <section className="border-t-2 border-background mt-20">
      <div className="section-container px-4 py-10">
        <div className="flex flex-col lg:flex-row items-start gap-16">
          <div className="w-full lg:w-2/5">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={logImg}
                alt="WabiSabiArt Logo"
                className="h-10 w-auto"
              />
              <h2 className="text-2xl font-bold text-foreground">
                WabiSabiArt
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed xl:w-2/3 text-justify">
              WabiSabiArt is a multi-vendor marketplace for handmade, custom,
              commission-based, and vintage products. It connects creators and
              buyers through a flexible system with secure checkout and scalable
              modern architecture.
            </p>
          </div>
          <div className=" lg:flex-1 w-full flex flex-col md:flex-row items-start gap-8 justify-between">
            {/* Brand & Description Section */}

            {/* Legal Section */}
            <div className="">
              <h3 className="font-bold text-xl text-foreground uppercase">
                Legal
              </h3>
              <ul className="space-y-3 mt-3.5 font-medium text-muted-foreground">
                {footerData.legal.items.map((subItem) => (
                  <li className="hover:text-foreground" key={subItem.label}>
                    <Link href={subItem.url}>{subItem.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Service Section */}
            <div className="">
              <h3 className="font-bold text-xl text-foreground uppercase">
                Service
              </h3>
              <ul className="space-y-3 mt-3.5 font-medium text-muted-foreground">
                {footerData.service.items.map((subItem) => (
                  <li className="hover:text-foreground" key={subItem.label}>
                    <Link href={subItem.url}>{subItem.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Section */}
            <div className="">
              <h3 className="font-bold text-xl text-foreground uppercase">
                Social
              </h3>
              <ul className="space-y-3 mt-3.5 font-medium text-muted-foreground">
                {footerData.social.items.map((subItem) => (
                  <li className="hover:text-foreground" key={subItem.label}>
                    <Link href={subItem.url}>{subItem.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="text-center text-muted-foreground mt-10 pt-4 border-t border-border">
          Copyright © {new Date().getFullYear()} WabiSabiArt. All rights
          reserved.
        </p>
      </div>
    </section>
  );
}

const footerData = {
  legal: {
    title: "Legal",
    items: [
      { label: "Terms of Use", url: "/terms" },
      { label: "Privacy Policy", url: "/privacy" },
      { label: "Cookie Policy", url: "/cookie" },
      { label: "Contact Us", url: "/contact" },
    ],
  },
  service: {
    title: "Service",
    items: [
      { label: "Become a Seller", url: "?seller-signup-modal=seller-signup" },
      { label: "Help Center", url: "/help" },
    ],
  },
  social: {
    title: "Social",
    items: [
      { label: "Maker's Story", url: "/" + "#maker-story" },
      { label: "Blogs", url: "/blog" },
    ],
  },
};