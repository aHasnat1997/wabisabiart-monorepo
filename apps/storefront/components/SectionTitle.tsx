export default function SectionTitle({
  title,
  subtitle,
  date,
  button,
}: {
  title: string;
  subtitle?: string;
  date?: string;
  button?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 justify-between mb-5 md:mb-7">
      <span className="flex flex-col-reverse md:flex-row items-start md:items-center gap-1 md:gap-8">
        <div>
          <h2 className="text-xl md:text-3xl lg:text-[32px] text-foreground font-bold">
            {title}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground md:mt-2 text-justify">
            {subtitle}
          </p>
        </div>
        <p className="text-base lg:text-xl font-medium text-primary">{date}</p>
      </span>
      <div>{button}</div>
    </div>
  );
}
