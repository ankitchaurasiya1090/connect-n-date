// src/app/auth/signup/page.tsx
import { AuthForm } from "@/components/auth/auth-form";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Connect Nearby',
  description: 'Create an account to join Connect Nearby.',
};

export default function SignUpPage() {
  return <AuthForm mode="signup" />;
}
