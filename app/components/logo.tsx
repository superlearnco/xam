import { cn } from "../lib/utils";

export const Logo = ({
  className,
  uniColor,
}: {
  className?: string;
  uniColor?: boolean;
}) => {
  return (
    <img
      src="/xam full.png"
      alt="XAM Logo"
      className={cn("h-5 w-auto", className)}
    />
  );
};

export const LogoIcon = ({
  className,
  uniColor,
}: {
  className?: string;
  uniColor?: boolean;
}) => {
  return (
    <img
      src="/xam full.png"
      alt="XAM Logo"
      className={cn("h-10 w-10", className)}
      role="img"
      aria-label="XAM mark"
    />
  );
};

export const LogoStroke = ({ className }: { className?: string }) => {
  return (
    <img
      src="/xam full.png"
      alt="XAM Logo"
      className={cn("size-7 w-7", className)}
    />
  );
};
