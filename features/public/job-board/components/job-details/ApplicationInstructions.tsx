import { parseApplicationInstructions } from "@/lib/job-board/jobDetailsUtils";

export function ApplicationInstructions({ value }: { value: string }) {
  const instructions = parseApplicationInstructions(value);
  if (!instructions.length) return null;

  return (
    <ul className="list-disc space-y-2 pl-5">
      {instructions.map((item, index) => (
        <li key={`${item.label ?? "instruction"}-${index}`} className="break-words font-semibold text-foreground">
          {item.label && <><span>{item.label}</span>{item.body ? ": " : ""}</>}
          {item.body && <span>{item.body}</span>}
        </li>
      ))}
    </ul>
  );
}
