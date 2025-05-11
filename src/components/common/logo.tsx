// src/components/common/logo.tsx
import Link from "next/link";
import { Compass } from "lucide-react";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-xl font-bold ${className}`}>
      <Compass className="h-7 w-7 text-primary" />
      <span className="text-foreground">ConnectNearby</span>
    </Link>
  );
}
