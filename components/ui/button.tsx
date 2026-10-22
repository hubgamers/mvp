import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  // Force flex-row + alignement horizontal strict et empêche les déformations des enfants
  "group/button inline-flex flex-row items-center justify-center shrink-0 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        // Style principal élégant (fond sombre mat / moderne)
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/80",
        
        // Variante Violet / Studio OBS (remplace le violet flashy par un violet néo-brutaliste très propre)
        purple:
          "bg-purple-600 text-white shadow-sm hover:bg-purple-500 active:bg-purple-700 border border-purple-500/30",
        
        // Secondary
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 border border-border/50",
        
        // Outline (Bordure fine, fond subtilement teinté au survol)
        outline:
          "border border-border/80 bg-background/50 backdrop-blur-xs shadow-xs text-foreground hover:bg-accent hover:text-accent-foreground hover:border-border",
        
        // Ghost
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        
        // Destructive
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        
        // Link
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3.5 py-2 gap-2",
        xs: "h-7 px-2.5 gap-1.5 rounded-md text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 px-3 gap-1.5 rounded-md text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 px-5 gap-2.5 text-base [&_svg:not([class*='size-'])]:size-5",
        icon: "size-9",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  render,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      render={render}
      {...props}
    >
      {/* Encapsulation explicite pour s'assurer que l'icône et le texte restent côte à côte */}
      <span className="inline-flex flex-row items-center justify-center gap-2 pointer-events-none">
        {children}
      </span>
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }