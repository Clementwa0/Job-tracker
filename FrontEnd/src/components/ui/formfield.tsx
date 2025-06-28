import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const FormField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  textarea = false,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  icon?: React.ElementType;
  textarea?: boolean;
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700">{label}</Label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />}
      {textarea ? (
        <Textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pl-10 min-h-24"
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={Icon ? "pl-10" : ""}
        />
      )}
    </div>
  </div>
);
