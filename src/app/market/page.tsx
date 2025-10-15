'use client';
import { CropCard } from '@/components/dashboard/crop-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser } from '@/firebase';
import type { CropListing } from '@/lib/types';
import { Loader2, Search, Store, ArrowLeft } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { countries as allCountries } from '@/lib/countries';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { defaultCrops } from '@/lib/default-crops';

export default function MarketPage() {
  const { user } = useUser();
  const router = useRouter();
  const [cropListings, setCropListings] = useLocalStorage<CropListing[]>('crops', []);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    setIsLoading(true);
    // Initialize with default crops if local storage is empty
    if (cropListings.length === 0) {
        // We assign a farmerId from the current user, or a dummy one if no user is logged in
        const initialCrops = defaultCrops.map(c => ({...c, farmerId: user?.uid || 'default-farmer'}));
        setCropListings(initialCrops);
    }
    setIsLoading(false);
  }, [user, cropListings.length, setCropListings, isClient]);


  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortOrder, setSortOrder] = useState('recent');

  const countries = useMemo(() => {
    if (!cropListings) return [];
    const countryNames = new Set(cropListings.map(l => l.country).filter(Boolean));
    const combinedCountries = [...allCountries];

    allCountries.forEach(c => {
      if (countryNames.has(c.name)) {
        // Already included
      }
    });

    return combinedCountries.sort((a,b) => a.name.localeCompare(b.name));

  }, [cropListings]);

  const filteredAndSortedListings = useMemo(() => {
    if (!cropListings) return [];
    
    let filtered = cropListings.filter(l => l.status === 'Listed');

    if (searchTerm) {
        filtered = filtered.filter((listing) =>
            listing.cropType.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    if (selectedCountry !== 'all') {
        filtered = filtered.filter(l => l.country?.trim() === selectedCountry);
    }

    switch (sortOrder) {
        case 'price_asc':
            return filtered.sort((a, b) => a.price - b.price);
        case 'price_desc':
            return filtered.sort((a, b) => b.price - a.price);
        case 'recent':
            return filtered.sort((a, b) => new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime());
        default:
            return filtered;
    }

  }, [cropListings, searchTerm, selectedCountry, sortOrder]);
  
  const renderContent = () => {
    if (!isClient || isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }

    if (!filteredAndSortedListings || filteredAndSortedListings.length === 0) {
        return <p className="text-center text-muted-foreground mt-8">No listings found matching your criteria.</p>
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAndSortedListings.map((listing) => (
          <CropCard key={listing.id} listing={listing} />
        ))}
      </div>
    );
  };

  return (
    <div className='container mx-auto py-8'>
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            Marketplace
          </h2>
          <p className="text-muted-foreground">
            Browse the latest crop listings directly from the farm.
          </p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border flex flex-col md:flex-row gap-4 sticky top-4 z-10 backdrop-blur-sm bg-background/80 my-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by crop type..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 lg:flex gap-4">
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {renderContent()}
    </div>
  );
}
