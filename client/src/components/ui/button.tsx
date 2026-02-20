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
          "bg-foreground text-background font-bold font-serif border border-foreground shadow-sm hover:bg-[#F0E6FF] hover:text-foreground hover:font-normal hover:border-foreground hover:shadow-md hover:-translate-y-0.5 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#A1A1AA] disabled:text-white disabled:border-[#A1A1AA]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm border-destructive-border disabled:bg-[#F4F4F5] disabled:text-[#A1A1AA] disabled:pointer-events-none",
        outline:
          "bg-white text-muted-foreground border border-muted font-serif font-normal text-sm shadow-sm hover:bg-[#F0E6FF] hover:text-foreground hover:border-foreground hover:shadow-md hover:-translate-y-0.5 disabled:bg-white disabled:text-[#A1A1AA] disabled:border-[#E5E5E5] disabled:pointer-events-none",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-[#FFB84D] disabled:bg-[#F4F4F5] disabled:text-[#A1A1AA] disabled:pointer-events-none",
        ghost: "hover:bg-[#F0E6FF] hover:text-foreground disabled:text-[#A1A1AA] disabled:bg-transparent disabled:pointer-events-none",
        link: "text-primary underline-offset-4 hover:underline disabled:text-[#A1A1AA] disabled:pointer-events-none",
      },
      size: {
        default: "h-9 px-6 py-2 text-sm",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8 text-base",
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
