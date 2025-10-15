'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles, ImagePlus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCropQualityNotes } from '@/ai/flows/generate-crop-quality-notes';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import type { CropListing } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

export default function EditListingPage({ params }: { params: { id: string } }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [crops, setCrops] = useLocalStorage<CropListing[]>('crops', []);
  const [listing, setListing] = useState<CropListing | null>(null);

  const [isListingLoading, setIsListingLoading] = useState(true);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);
  const [dataUris, setDataUris] = useState<(string | null)[]>([null, null, null]);
  const [qualityNotes, setQualityNotes] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cropType, setCropType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  
  useEffect(() => {
    if (isUserLoading) return; // Wait for user to be loaded

    setIsListingLoading(true);
    if (crops.length > 0) {
      const foundListing = crops.find(c => c.id === params.id);
      if (foundListing) {
        setListing(foundListing);
        if (user && foundListing.farmerId !== user.uid) {
          toast({ variant: 'destructive', title: 'Unauthorized', description: "You don't have permission to edit this listing."});
          router.push('/dashboard/farmer');
          return;
        }
        setCropType(foundListing.cropType);
        setQuantity(foundListing.quantity.toString());
        setPrice(foundListing.price.toString());
        setQualityNotes(foundListing.qualityNotes || '');
        if (foundListing.images && foundListing.images.length > 0) {
          const currentPreviews = [null, null, null];
          const currentDataUris = [null, null, null];
          foundListing.images.forEach((img, i) => {
              if (i < 3) {
                  currentPreviews[i] = img;
                  currentDataUris[i] = img;
              }
          });
          setPreviews(currentPreviews);
          setDataUris(currentDataUris);
        }
      } else {
        toast({ variant: 'destructive', title: 'Not Found', description: "Listing not found."});
        router.push('/dashboard/farmer');
      }
      setIsListingLoading(false);
    } else if (crops) {
      // Crops are loaded but empty, meaning the listing can't be found
      setIsListingLoading(false);
       toast({ variant: 'destructive', title: 'Not Found', description: "Listing not found."});
       router.push('/dashboard/farmer');
    }
  }, [params.id, crops, user, router, toast, isUserLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviews(prev => {
          const newPreviews = [...prev];
          newPreviews[index] = result;
          return newPreviews;
        });
        setDataUris(prev => {
          const newDataUris = [...prev];
          newDataUris[index] = result;
          return newDataUris;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateNotes = async () => {
    if (!dataUris[0] || !cropType) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please upload at least the first crop image and select the crop type.',
      });
      return;
    }
    setIsLoadingNotes(true);
    try {
      const result = await generateCropQualityNotes({ cropPhotoDataUri: dataUris[0], cropType });
      setQualityNotes(result.qualityNotes);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'AI Analysis Failed', description: 'Could not generate quality notes. Please try again.' });
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing || !cropType || !quantity || !price || !dataUris[0] || !dataUris[1] || !dataUris[2]) {
      toast({ variant: 'destructive', title: 'Incomplete Form', description: 'Please fill out all fields and upload all three images.' });
      return;
    }

    setIsSubmitting(true);
    
    const imagesToSave = dataUris.filter((uri): uri is string => uri !== null);

    const updatedListing: CropListing = {
        ...listing,
        cropType: cropType,
        quantity: Number(quantity),
        price: Number(price),
        images: imagesToSave,
        qualityNotes: qualityNotes,
        aiVerified: qualityNotes !== '' && listing.qualityNotes !== qualityNotes,
    };

    setCrops(prevCrops => prevCrops.map(c => c.id === params.id ? updatedListing : c));

    toast({ title: 'Listing Updated!', description: `${cropType} has been successfully updated.` });
    router.push('/dashboard/farmer');
    
    setIsSubmitting(false);
  };
  
  if (isUserLoading || isListingLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!listing) {
     return <div className="flex h-screen w-full items-center justify-center"><p>Listing not found or you do not have permission to edit it.</p></div>;
  }

  return (
    <>
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
            Edit Listing
            </h2>
            <p className="text-muted-foreground">
            Update the details for your crop listing.
            </p>
        </div>
      </div>
      <form className="grid md:grid-cols-3 gap-8 items-start mt-4" onSubmit={handleSubmit}>
        <div className="md:col-span-2 grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Crop Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cropType">Crop Type</Label>
                  <Select onValueChange={setCropType} value={cropType}>
                    <SelectTrigger id="cropType"><SelectValue placeholder="Select crop type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wheat">Wheat</SelectItem>
                      <SelectItem value="Rice">Rice</SelectItem>
                      <SelectItem value="Corn">Corn</SelectItem>
                      <SelectItem value="Barley">Barley</SelectItem>
                      <SelectItem value="Soybean">Soybean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity (in tons)</Label>
                  <Input id="quantity" type="number" placeholder="e.g., 10" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price (per ton)</Label>
                <Input id="price" type="number" placeholder="e.g., 250" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Crop Images</CardTitle>
              <CardDescription>Upload three photos of your crop.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map(index => (
                  <div key={index} className="grid gap-2">
                    <Label htmlFor={`crop-image-${index}`} className="border-2 border-dashed border-muted-foreground/50 rounded-lg aspect-video flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent relative overflow-hidden">
                      {previews[index] ? (
                        <Image src={previews[index]!} alt={`Crop preview ${index + 1}`} fill unoptimized className="object-cover" />
                      ) : (
                        <><ImagePlus className="w-10 h-10 text-muted-foreground" /><span className="mt-2 text-sm font-semibold">Upload Image {index + 1}</span></>
                      )}
                      <Input id={`crop-image-${index}`} type="file" className="sr-only" onChange={(e) => handleFileChange(e, index)} accept="image/*" />
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>AI Quality Assistant</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button type="button" onClick={handleGenerateNotes} disabled={isLoadingNotes || !previews[0] || !cropType}>
                {isLoadingNotes ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Regenerate AI Notes
              </Button>
              <div className="grid gap-2">
                <Label htmlFor="quality-notes">AI Generated Notes</Label>
                <Textarea id="quality-notes" placeholder="Click 'Generate' to have our AI analyze your crop image..." value={qualityNotes} readOnly={isLoadingNotes} onChange={(e) => setQualityNotes(e.target.value)} rows={5} />
              </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <>Save Changes</>}
                </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </>
  );
}
