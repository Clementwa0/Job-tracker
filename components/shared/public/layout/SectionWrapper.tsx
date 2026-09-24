import type { ElementType, ReactNode } from "react";

type SectionWrapperProps = {
  id?: string;
  children: ReactNode;
  /** Outer element (section wrapper) classes - background, borders, overflow, etc. */
  className?: string;
  /** Inner container classes - max-width, grid, flex, etc. */
  containerClassName?: string;
  /** Inner container vertical padding - e.g. "py-16", "py-20 lg:py-24" */
  spacingClassName?: string;
  /** HTML tag for the outer element. Defaults to "section". */
  as?: ElementType;
};

export default function SectionWrapper({
  id,
  children,
  className = "",
  containerClassName = "",
  spacingClassName = "py-16",
  as: Tag = "section",
}: SectionWrapperProps) {
  return (
    <Tag id={id} className={className}>
      <div
        className={[
          "mx-auto w-full px-4 sm:px-6 lg:px-8",
          spacingClassName,
          containerClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </Tag>
  );
}