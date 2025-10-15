'use client';

import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import type { CropListing } from '@/lib/types';
import Link from 'next/link';
import { Icons } from '../icons';

interface CropCardProps {
  listing: CropListing & { id: string };
}

export function CropCard({ listing }: CropCardProps) {
  // This logic ensures that `firstImage` is always a valid URL.
  // It checks if the `images` array exists, has items, and the first item is a non-empty string.
  // If not, it provides a default placeholder URL.
  const firstImage = listing.images?.[0] || "https://picsum.photos/seed/placeholder/600/400";

  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col w-full">
      <CardHeader className="p-0 relative">
        <Link href={`/market/${listing.id}`} className="block">
          <Image
            src={firstImage}
            alt={listing.cropType}
            width={600}
            height={400}
            unoptimized
            className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={listing.cropType.toLowerCase()}
          />
        </Link>
        {listing.aiVerified && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 bg-primary/80 text-primary-foreground backdrop-blur-sm"
          >
            <Icons.verified className="w-4 h-4 mr-1" /> AI Verified
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/market/${listing.id}`}>
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold font-headline hover:text-primary transition-colors">
              {listing.cropType}
            </h3>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">${listing.price}</p>
              <p className="text-xs text-muted-foreground">per ton</p>
            </div>
          </div>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">
          {listing.quantity} tons available
        </p>
        <div className="flex items-center text-xs text-muted-foreground mt-2">
          <MapPin className="w-3 h-3 mr-1.5" />
          <span>{listing.location}</span>
        </div>
      </CardContent>
    </Card>
  );
}
