// This is a Server Component, so it can export generateStaticParams
import ListingDetailPageClient from '@/components/market/listing-detail-page';
import { defaultCrops } from '@/lib/default-crops';

// This function tells Next.js which dynamic pages to build at build time
export async function generateStaticParams() {
  // Ensure defaultCrops is an array before mapping
  if (!Array.isArray(defaultCrops) || defaultCrops.length === 0) {
    return [];
  }
  return defaultCrops.map((crop) => ({
    id: crop.id,
  }));
}

// The page component itself remains simple and passes params to the client component.
// It is a Server Component and does NOT use 'use client'.
export default function ListingDetailPage({ params }: { params: { id: string } }) {
    return <ListingDetailPageClient params={params} />;
}
