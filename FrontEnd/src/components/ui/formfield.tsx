import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  icon?: LucideIcon;
  className?: string;
  required?: boolean;
}

export const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormFieldProps
>(({ label, value, onChange, placeholder, type = "text", textarea, icon: Icon, className, required }, ref) => {
  return (
    <div className={cn("mobile-input-spacing", className)}>
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        )}
        {textarea ? (
          <Textarea
            ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={cn(
              "max-h-[100px] resize-y",
              Icon && "pl-10"
            )}
            rows={4}
          />
        ) : (
          <Input
            ref={ref as React.ForwardedRef<HTMLInputElement>}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={cn(
              "mobile-full-width",
              Icon && "pl-10"
            )}
          />
        )}
      </div>
    </div>
  );
});

FormField.displayName = "FormField";