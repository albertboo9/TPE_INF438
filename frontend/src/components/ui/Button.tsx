
import { ReactNode, ButtonHTMLAttributes } from "react"
import { cn } from "../../lib/utils"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: "primary" | "secondary" | "outline" | "light"
  fullWidth?: boolean
}

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {

  const styles = {
    primary:
      "bg-primary text-white hover:opacity-90",

    secondary:
      "bg-secondary text-white hover:opacity-90",

    outline:
      "border border-primary text-primary",

    light:
      "bg-white text-primary"
  }

  return (
    <button
      className={cn(
        `
        px-6
        py-3
        rounded-xl
        font-semibold
        transition-all
        duration-300
        active:scale-[0.98]
        disabled:opacity-50
        disabled:cursor-not-allowed
        `,
        styles[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}