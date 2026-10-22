import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(0,242,254,0.3)] [a]:hover:bg-primary/90",
        secondary:
          "bg-secondary/90 text-secondary-foreground border-white/5 [a]:hover:bg-secondary",
        destructive:
          "bg-destructive/15 text-destructive border border-destructive/30 focus-visible:ring-destructive/20 [a]:hover:bg-destructive/25",
        outline:
          "border-white/10 text-muted-foreground bg-white/[0.02] [a]:hover:bg-white/[0.05] [a]:hover:text-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        live: "bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_14px_rgba(239,68,68,0.3)] animate-pulse",
        cyber:
          "bg-cyan-500/15 text-cyan-400 border border-cyan-500/35 shadow-[0_0_14px_rgba(0,242,254,0.25)]",
        violet:
          "bg-purple-500/15 text-purple-300 border border-purple-500/35 shadow-[0_0_14px_rgba(168,85,247,0.25)]",
        success:
          "bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
        warning:
          "bg-amber-500/15 text-amber-400 border border-amber-500/35",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
