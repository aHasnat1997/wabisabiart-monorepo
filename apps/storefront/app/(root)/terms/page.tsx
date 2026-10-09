import HtmlRenderer from "@/components/htmlRenderer";
import { getLeagalData } from "@/lib/auth-server";

export default async function TermsOfUsePage() {
  const text = await getLeagalData("TERMS_OF_USE");
  return (
    <div>
      <section className="text-card max-w-5xl mx-auto rounded-xl md:rounded-2xl bg-linear-to-b from-[#799D02] to-[#567100] md:px-8 px-6 md:py-16 py-10 text-center">
        <p className="uppercase text-sm md:text-base text-card/75 mb-1 md:mb-2">
          Legal
        </p>
        <h3 className="text-3xl md:text-4xl font-bold text-card">
          Terms of Use
        </h3>
        <p className="text-card/75 mt-2 text-sm md:text-base md:mt-4 max-w-2xl mx-auto leading-relaxed">
          Please read these Terms of Use carefully before using our website and
          services. By accessing or using our platform, you agree to be bound by
          these Terms. If you do not agree with any part of these Terms, please
          do not use our services.
        </p>
      </section>

      <section className="-mb-16 py-8 pb-32 max-w-5xl mx-auto">
        <div className="bg-background w-full mx-auto p-6 md:p-8 rounded-xl border border-border/25 shadow">
          <div className="space-y-10">
            {<HtmlRenderer html={text.content} isMarkdown={true} />}
          </div>
        </div>
      </section>
    </div>
  );
}
