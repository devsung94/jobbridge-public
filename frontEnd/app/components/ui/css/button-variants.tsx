import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",

        primary: "bg-blue-600 text-white hover:bg-blue-700",
        gray: "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
        danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",

        fullWidthBlue: "w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition mt-4",

        white: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:border-white/30 dark:hover:bg-white/20",
        black: "bg-black text-white hover:bg-gray-900",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-yellow-400 text-black hover:bg-yellow-500",
        textOnly: "bg-transparent text-blue-600 hover:underline p-0 h-auto",
      
        translucent: "bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed hover:bg-gray-300",
     
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
