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
import { Loader2, Search } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { countries as allCountries } from '@/lib/countries';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { defaultCrops } from '@/lib/default-crops';

export default function RetailerDashboard() {
  const { user } = useUser();
  const [allCrops, setAllCrops] = useLocalStorage<CropListing[]>('crops', []);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    setIsLoading(true);
    // Initialize with default crops if local storage is empty
    if (allCrops.length === 0) {
        // We assign a farmerId from the current user, or a dummy one if no user is logged in
        const initialCrops = defaultCrops.map(c => ({...c, farmerId: user?.uid || 'default-farmer'}));
        setAllCrops(initialCrops);
    }
    setIsLoading(false);
  }, [user, allCrops.length, setAllCrops, isClient]);


  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortOrder, setSortOrder] = useState('recent');
    
  const countries = useMemo(() => {
    if (!allCrops) return [];
    const countryNames = new Set(allCrops.map(l => l.country).filter(Boolean));
    const combinedCountries = [...allCountries];

    allCountries.forEach(c => {
      if (countryNames.has(c.name)) {
        // Already included
      }
    });

    return combinedCountries.sort((a,b) => a.name.localeCompare(b.name));
  }, [allCrops]);

  const filteredAndSortedListings = useMemo(() => {
    if (!allCrops) return [];
    
    let filtered = allCrops.filter(l => l.status === 'Listed');

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

  }, [allCrops, searchTerm, selectedCountry, sortOrder]);
  
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
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Browse Crops
          </h2>
          <p className="text-muted-foreground">
            Find the best produce from trusted farmers.
          </p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border flex flex-col md:flex-row gap-4 sticky top-0 md:top-4 z-10 backdrop-blur-sm bg-background/80 mt-4">
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
      
      <div className='mt-8'>
        {renderContent()}
      </div>
    </>
  );
}
