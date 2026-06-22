export type ApplyMethodType = "external_link" | "email" | "whatsapp";

export interface ApplyMethod {
  type: ApplyMethodType;
  value: string;
}

const LABELS: Record<ApplyMethodType, string> = {
  external_link: "Apply via external link",
  email: "Apply via email",
  whatsapp: "Apply via WhatsApp",
};

export function getApplyMethodLabel(type: ApplyMethodType): string {
  return LABELS[type] ?? "Apply";
}

export function executeApply(method: ApplyMethod, jobTitle?: string): void {
  const subject = jobTitle ? `Application: ${jobTitle}` : "Job application";

  switch (method.type) {
    case "external_link": {
      const url = method.value.startsWith("http") ? method.value : `https://${method.value}`;
      window.open(url, "_blank", "noopener,noreferrer");
      break;
    }
    case "email": {
      window.location.href = `mailto:${encodeURIComponent(method.value)}?subject=${encodeURIComponent(subject)}`;
      break;
    }
    case "whatsapp": {
      const digits = method.value.replace(/\D/g, "");
      window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer");
      break;
    }
  }
}
