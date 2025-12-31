const Divider = () => {
  return (
    <div className="w-24 h-1 bg-linear-to-r from-deco-emerald to-accent mx-auto rounded-full" />
  );
};

const Root: React.FC<React.HtmlHTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => {
  return (
    <div className="flex flex-col items-center gap-4" {...props}>
      {children}
      <Divider />
    </div>
  );
};

const Label: React.FC<React.HtmlHTMLAttributes<HTMLSpanElement>> = ({
  children,
  ...props
}) => {
  return (
    <span
      className="text-lg text-deco-emerald uppercase tracking-wider"
      {...props}
    >
      {children}
    </span>
  );
};

const Title: React.FC<React.HtmlHTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...props
}) => {
  return (
    <h1
      className="text-7xl text-foreground text-center font-display"
      {...props}
    >
      {children}
    </h1>
  );
};

const Subtitle: React.FC<React.HtmlHTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...props
}) => {
  return (
    <h2
      className="text-center text-lg text-muted-foreground max-w-3/4 lg:max-w-1/2"
      {...props}
    >
      {children}
    </h2>
  );
};

const ChapterHeader = {
  Root,
  Label,
  Title,
  Subtitle,
};

export default ChapterHeader;
