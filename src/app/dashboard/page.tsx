'use client';

// This is a placeholder page.
// The actual redirection to the correct dashboard (farmer/retailer)
// is handled by the logic in the DashboardLayout component.
// This page simply provides a valid route at /dashboard to prevent a 404
// and shows a loader while the redirection is happening.

import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
