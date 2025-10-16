'use client';
import React, { useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { DashboardNav } from '@/components/dashboard/nav';
import { UserNav } from '@/components/dashboard/user-nav';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    // This effect handles redirecting the user to their specific dashboard.
    if (userProfile && (pathname === '/dashboard' || pathname === '/dashboard/farmer/listings')) {
      router.replace(`/dashboard/${userProfile.role}`);
    }
  }, [userProfile, pathname, router]);

  const isLoading = isUserLoading || isProfileLoading;
  
  // If we are still loading authentication or profile data, show a spinner.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is not logged in (and we're done loading), we don't need to render the dashboard layout.
  // The useEffect above will handle the redirection.
  if (!user) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If the profile is loaded but the user is on a mismatched dashboard path,
  // show a loader until redirection finishes. This prevents flashing incorrect content.
  if (userProfile && pathname.startsWith('/dashboard/') && !pathname.startsWith(`/dashboard/${userProfile.role}`) && pathname !== '/dashboard/settings' && !pathname.startsWith('/market')) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Icons.logo className="size-8 text-primary" />
            <div className="flex flex-col items-start transition-all duration-300 ease-in-out group-data-[collapsible=icon]:-translate-x-12 group-data-[collapsible=icon]:opacity-0">
              <span className="font-headline text-lg font-bold text-foreground">
                AgriLink AI
              </span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <DashboardNav />
        </SidebarContent>
        <SidebarFooter>
          <UserNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:pt-4">
          <SidebarTrigger className="md:hidden" />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
