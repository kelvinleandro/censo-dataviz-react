interface SectionProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  secondaryBg?: boolean;
}

const Section: React.FC<SectionProps> = ({
  children,
  secondaryBg = false,
  ...props
}) => {
  return (
    <section
      className={`px-6 py-20 min-h-screen ${
        !secondaryBg ? "bg-background" : "bg-deco-navy"
      }`}
      {...props}
    >
      {children}
    </section>
  );
};

export default Section;
