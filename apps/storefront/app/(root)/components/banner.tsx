import flowerImg from "@/assets/images/flower.png";
import Image from "next/image";

export default function Banner() {
  return (
    <section>
      <div className="lg:pl-8 xl:pl-16 text-card rounded-xl md:rounded-2xl bg-linear-to-b from-[#799D02] to-[#567100] form top">
        <div className="flex flex-col lg:flex-row justify-between gap-4 md:gap-0 items-center">
          <span className="w-full lg:w-1/2 p-5 md:p-16 lg:p-0">
            <h1 className="text-4xl md:text-5xl xl:text-[64px] mt-4 md:mt-0 font-bold md:font-extrabold md:leading-16">
              Always Human <br /> Made
            </h1>
            <p className="text-xl md:text-2xl xl:text-[32px] mt-8 md:mt-16">
              See our vetting and policies
            </p>
          </span>
          <Image
            className="w-cover h-52 md:h-72 lg:h-84 xl:h-106"
            src={flowerImg}
            alt="flower"
            width={750}
            height={750}
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
}
