import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

const NotFoundPage = () => {
  return (
    <Suspense>
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Section: Content */}
        <div className="flex flex-col items-center justify-center bg-background px-4 py-8 text-center">
          <div className="mb-8 inline-block rounded-full bg-primary/10 px-6 py-2">
            <span className="text-xl font-semibold text-primary">
              404 Error
            </span>
          </div>

          <h2 className="mb-4 text-5xl font-bold text-foreground sm:text-6xl">
            Whoops!
          </h2>

          <h3 className="mb-3 text-2xl font-semibold text-foreground sm:text-3xl">
            Something went wrong
          </h3>

          <p className="mb-8 max-w-md text-base text-muted-foreground sm:text-lg">
            The page you&apos;re looking for isn&apos;t found. We suggest you go
            back to the home page.
          </p>

          <Link href={"/"}>
            <Button
              size="lg"
              className="rounded-lg bg-secondary text-base font-semibold text-secondary-foreground hover:bg-secondary/90"
            >
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Right Section: Illustration */}
        <div className="relative min-h-100 w-full bg-primary/5 p-8 max-lg:hidden lg:min-h-screen">
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5">
            <Image
              src="https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/error/image-1.png"
              alt="404 illustration"
              height={500}
              width={500}
              className="h-[clamp(260px,25vw,406px)] w-auto object-contain drop-shadow-2xl"
              priority
            />
          </div>

          {/* Decorative elements */}
          <div className="absolute top-10 right-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl"></div>
          <div className="absolute bottom-10 left-10 h-32 w-32 rounded-full bg-secondary/10 blur-3xl"></div>
        </div>
      </div>
    </Suspense>
  );
};

export default NotFoundPage;
