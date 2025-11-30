import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#6600ff] text-white font-bold font-serif border border-transparent shadow-sm hover:bg-[#F5F3FF] hover:text-[#6600ff] hover:font-normal hover:border-[#6600ff]/50 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-100 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#6600ff] disabled:text-white",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm border-destructive-border disabled:opacity-50 disabled:pointer-events-none",
        outline:
          "bg-white text-muted-foreground border border-muted font-serif font-normal text-base shadow-sm hover:bg-[#F5F3FF] hover:text-[#6600ff] hover:border-[#6600ff]/50 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 disabled:opacity-50 disabled:pointer-events-none",
        ghost: "hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none",
        link: "text-primary underline-offset-4 hover:underline disabled:opacity-50 disabled:pointer-events-none",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={style}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
