// src/app/profile/page.tsx
import { AuthenticatedPageLayout } from "@/components/layout/authenticated-page-layout";
import { ProfileForm } from "@/components/profile/profile-form";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile | Connect Nearby',
  description: 'View and edit your Connect Nearby profile.',
};

export default function MyProfilePage() {
  return (
    <AuthenticatedPageLayout title="My Profile">
      <ProfileForm />
    </AuthenticatedPageLayout>
  );
}
