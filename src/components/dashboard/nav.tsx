"use client";
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  PlusCircle,
  ShoppingBag,
  Settings,
  Store,
  List,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { User } from '@/lib/types';
import { doc } from 'firebase/firestore';


export function DashboardNav() {
  const pathname = usePathname();
  const { user: authUser } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(
    () => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null),
    [firestore, authUser]
  );
  const { data: userProfile } = useDoc<User>(userRef);

  const farmerNav = [
    { href: '/dashboard/farmer', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/farmer/listings', label: 'My Listings', icon: List },
    { href: '/dashboard/farmer/listings/new', label: 'New Listing', icon: PlusCircle },
    { href: '/market', label: 'Market', icon: Store },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];
  
  const retailerNav = [
    { href: '/dashboard/retailer', label: 'Browse Crops', icon: ShoppingBag },
    { href: '/market', label: 'Market', icon: Store },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  // If the user profile is still loading, we can show a placeholder or nothing.
  if (!userProfile) {
    // You can return a loading skeleton here if you want
    return null;
  }

  const navItems = userProfile.role === 'farmer' ? farmerNav : retailerNav;

  return (
     <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard/farmer' || pathname === '/dashboard/farmer')}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
