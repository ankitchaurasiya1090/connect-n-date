// src/app/dashboard/page.tsx
import { AuthenticatedPageLayout } from "@/components/layout/authenticated-page-layout";
import { MapPlaceholder } from "@/components/map/map-placeholder";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Connect Nearby',
  description: 'Find and connect with people nearby.',
};

export default function DashboardPage() {
  return (
    <AuthenticatedPageLayout title="Dashboard">
      <MapPlaceholder />
    </AuthenticatedPageLayout>
  );
}
