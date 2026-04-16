import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 [&_svg]:size-4 shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-white text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-gray-700",

        primary:
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:from-blue-700 hover:to-purple-700 hover:shadow-lg active:scale-[0.98]",

        secondary:
          "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",

        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 active:scale-[0.98]",

        outline:
          "border border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 hover:bg-gray-300 dark:hover:bg-green-700 dark:hover:text-white",

        ghost:
          "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",

        link:
          "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline",
      },

      size: {
        sm: "h-8 px-3 rounded-md",
        default: "h-10 px-4 rounded-md",
        lg: "h-11 px-6 rounded-lg",
        icon: "h-9 w-9 p-0",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };