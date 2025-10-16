// This is a Server Component, so it can export generateStaticParams
import ListingDetailPageClient from '@/components/market/listing-detail-page';

// The page component itself remains simple and passes params to the client component.
// It is a Server Component and does NOT use 'use client'.
export default function ListingDetailPage({ params }: { params: { id: string } }) {
    return <ListingDetailPageClient params={params} />;
}
