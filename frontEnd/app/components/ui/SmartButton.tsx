import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { buttonVariants } from "./css/button-variants";


type SmartButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    onClick: () => Promise<any>; // async 함수만 허용
  };

export function SmartButton({
  className,
  variant,
  size,
  asChild = false,
  onClick,
  children,
  ...props
}: SmartButtonProps) {
  const Comp = asChild ? Slot : "button";
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      await onClick(); // async 작업 수행
    } finally {
      setIsLoading(false); // 성공/실패 관계없이 로딩 해제
    }
  };

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={handleClick}
      disabled={isLoading}
      aria-disabled={isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin size-4" />}
      {children}
    </Comp>
  );
}
