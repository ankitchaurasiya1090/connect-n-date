// src/app/auth/layout.tsx
import { Logo } from "@/components/common/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Logo />
      </div>
      <main className="w-full max-w-md">{children}</main>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')).get('redirectedFrom') ? 'You need to sign in to continue.' : ''}
      </p>
    </div>
  );
}
