import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Label } from "../ui/label";

interface FormFieldWrapperProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
  htmlFor?: string;
}

export function FormFieldWrapper({
  label,
  description,
  error,
  required,
  icon: Icon,
  children,
  className,
  labelClassName,
  htmlFor,
}: FormFieldWrapperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <Label
            htmlFor={htmlFor}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="relative">{children}</div>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
