// src/components/layout/authenticated-page-layout.tsx
import { AppHeader } from "./app-header";

interface AuthenticatedPageLayoutProps {
  children: React.ReactNode;
  title?: string; // Optional title for the page
  containerClassName?: string;
}

export function AuthenticatedPageLayout({ children, title, containerClassName = "container py-8" }: AuthenticatedPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <AppHeader />
      <main className="flex-1">
        <div className={containerClassName}>
          {title && (
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">
              {title}
            </h1>
          )}
          {children}
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        Connect Nearby &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
