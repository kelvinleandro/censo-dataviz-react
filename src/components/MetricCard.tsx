const Root: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={`bg-(image:--image-gradient-card) space-y-1 border rounded-2xl p-6 border-deco-emerald/20 transition-all duration-300 hover:scale-[1.02] hover:border-deco-emerald/50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const Value: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={`font-display text-deco-emerald text-5xl md:text-7xl ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

const Label: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3
      className={`font-display text-foreground text-xl md:text-2xl ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

const Description: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p className={`text-muted-foreground text-sm ${className}`} {...props}>
      {children}
    </p>
  );
};

const MetricCard = {
  Root,
  Value,
  Label,
  Description,
};

export default MetricCard;
