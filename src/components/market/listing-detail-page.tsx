'use client';
import Image from 'next/image';
import {
  useDoc,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import { doc } from 'firebase/firestore';
import type { CropListing, User } from '@/lib/types';
import {
  Loader2,
  MapPin,
  ArrowLeft,
  Calendar,
  Package,
  ShieldCheck,
  Star,
  Edit,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/use-local-storage';

export default function ListingDetailPageClient({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const router = useRouter();

  const [crops] = useLocalStorage<CropListing[]>('crops', []);
  const [listing, setListing] = useState<CropListing | null>(null);
  const [isListingLoading, setIsListingLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const foundListing = crops.find(c => c.id === params.id);
    if (foundListing) {
      setListing(foundListing);
    }
    setIsListingLoading(false);
  }, [params.id, crops, isClient]);

  const userRef = useMemoFirebase(
    () => (firestore && listing ? doc(firestore, 'users', listing.farmerId) : null),
    [firestore, listing]
  );
  const { data: farmerProfile, isLoading: isFarmerLoading } = useDoc<User>(userRef);
  
  const isLoading = !isClient || isListingLoading || isFarmerLoading;
  const isOwnListing = authUser?.uid === listing?.farmerId;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-2xl font-bold">Listing not found.</p>
        <Button onClick={() => router.push('/market')} className="mt-4">
          Back to Market
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className='flex justify-between items-center mb-4'>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {isOwnListing && (
          <Button asChild>
            <Link href={`/dashboard/farmer/listings/edit/${listing.id}`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Listing
            </Link>
          </Button>
        )}
      </div>
      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
           <Carousel className="w-full">
              <CarouselContent>
                {listing.images && listing.images.length > 0 ? (
                  listing.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <Card className="overflow-hidden">
                        <div className="relative w-full aspect-[4/3]">
                          <Image
                            src={image}
                            alt={`${listing.cropType} image ${index + 1}`}
                            fill
                            unoptimized
                            className="object-cover"
                            priority={index === 0}
                          />
                        </div>
                      </Card>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem>
                    <Card className="overflow-hidden">
                      <div className="relative w-full aspect-[4/3] bg-muted flex items-center justify-center">
                        <Package className="w-16 h-16 text-muted-foreground" />
                      </div>
                    </Card>
                  </CarouselItem>
                )}
              </CarouselContent>
              {listing.images && listing.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </>
              )}
            </Carousel>
        </div>
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-4xl font-headline flex justify-between items-start">
                {listing.cropType}
                 {listing.aiVerified && (
                    <Badge
                      variant="secondary"
                      className="bg-primary/80 text-primary-foreground backdrop-blur-sm border-none shadow-lg text-sm ml-2"
                    >
                      <Icons.verified className="w-4 h-4 mr-1" /> AI Verified
                    </Badge>
                  )}
              </CardTitle>
              <div className="flex items-center text-muted-foreground pt-2 flex-wrap">
                <div className='flex items-center'>
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{listing.location}</span>
                </div>
                <Separator orientation="vertical" className="h-4 mx-4" />
                <span>{listing.quantity} tons available</span>
              </div>
               <div className="flex items-center text-muted-foreground pt-2">
                 <Calendar className="w-4 h-4 mr-2" />
                <span>Listed on {format(new Date(listing.listingDate), 'MMM d, yyyy')}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-right my-4">
                  <p className="text-4xl font-bold text-primary">${listing.price}</p>
                  <p className="text-sm text-muted-foreground font-body font-normal">per ton</p>
                </div>
              {listing.qualityNotes && (
                <div className="mt-4 p-4 bg-accent/50 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 text-lg">
                    <Icons.verified className="w-5 h-5 text-primary" /> AI Quality Assessment
                  </h4>
                  <p className="text-muted-foreground text-base mt-2">{listing.qualityNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          {farmerProfile && (
             <Card>
                <CardHeader>
                    <CardTitle>About the Farmer</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={farmerProfile.avatar} alt={farmerProfile.name} />
                            <AvatarFallback>{farmerProfile.avatarFallback}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-lg">{farmerProfile.name}</p>
                            <p className="text-sm text-muted-foreground">{farmerProfile.location}</p>
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-around text-sm">
                        <div className="text-center">
                            <p className="font-bold flex items-center justify-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-400" /> {farmerProfile.reputation}</p>
                            <p className="text-muted-foreground">Reputation</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold flex items-center justify-center gap-1"><ShieldCheck className="w-4 h-4 text-green-600" /> {farmerProfile.verification}</p>
                            <p className="text-muted-foreground">Status</p>
                        </div>
                    </div>
                </CardContent>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
}
