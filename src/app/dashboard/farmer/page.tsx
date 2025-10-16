'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowUpRight, DollarSign, List, Loader2, PlusCircle, MoreHorizontal, Edit, Trash2, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { CropListing } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { collection, query, where, doc, deleteDoc } from 'firebase/firestore';

export default function FarmerDashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userCropsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(collection(firestore, 'crops'), where('farmerId', '==', user.uid))
        : null,
    [firestore, user]
  );
  const { data: userCrops, isLoading: areCropsLoading } = useCollection<CropListing>(userCropsQuery);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<CropListing | null>(null);

  const handleDeleteClick = (listing: CropListing) => {
    setListingToDelete(listing);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!listingToDelete || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'crops', listingToDelete.id));
      toast({
        title: 'Listing Deleted',
        description: `Your listing for ${listingToDelete.cropType} has been removed.`,
      });
    } catch (e) {
      console.error("Error deleting document: ", e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete the listing. Please try again.',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };
  
  const totalRevenue = userCrops?.filter(l => l.status === 'Sold').reduce((acc, l) => acc + l.price * l.quantity, 0) || 0;
  const activeListings = userCrops?.filter(l => l.status === 'Listed').length || 0;

  const PageLoader = () => (
    <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  if (areCropsLoading || isUserLoading) {
      return <PageLoader />;
  }

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Farmer Dashboard
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your farm&apos;s activity.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Based on sold listings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Listings
            </CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListings}</div>
            <p className="text-xs text-muted-foreground">Currently on the market</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Listings</CardTitle>
            <CardDescription>
              An overview of your crop listings.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/farmer/listings/new">
              <Upload className="mr-2 h-4 w-4" /> Upload Product
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Crop</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Listed</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="hidden md:table-cell">Quantity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userCrops && userCrops.length > 0 ? (
                userCrops.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                         <Avatar className="hidden h-12 w-12 sm:flex rounded-md">
                           {listing.images && listing.images.length > 0 ? (
                              <AvatarImage
                                src={listing.images[0]}
                                alt={listing.cropType}
                                className="object-cover"
                              />
                           ) : <AvatarFallback>{listing.cropType.substring(0,2)}</AvatarFallback>}
                          </Avatar>
                        <div className="font-medium">{listing.cropType}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          listing.status === 'Sold' ? 'secondary' : 'default'
                        }
                        className={
                          listing.status === 'Listed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                            : listing.status === 'Negotiating'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                            : listing.status === 'Sold'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : ''
                        }
                      >
                        {listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {listing.listingDate ? formatDistanceToNow(new Date(listing.listingDate), { addSuffix: true }) : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">${listing.price}/ton</TableCell>
                    <TableCell className="hidden md:table-cell">{listing.quantity} tons</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/market/${listing.id}`}>
                                <ArrowUpRight className="mr-2 h-4 w-4" /> View Listing
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/farmer/listings/edit/${listing.id}`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(listing)} className="text-red-600 focus:text-red-600">
                               <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={6} className="text-center h-24">
                     <p className='font-semibold mb-2'>No listings yet!</p>
                     <p className='text-muted-foreground mb-4'>Ready to sell? Create your first listing.</p>
                     <Button asChild>
                        <Link href="/dashboard/farmer/listings/new">
                          <PlusCircle className="mr-2 h-4 w-4" /> Create Listing
                        </Link>
                     </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              listing for <span className="font-bold">{listingToDelete?.cropType}</span> from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
