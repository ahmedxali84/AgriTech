'use client';

import { useState } from 'react';
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
import { Loader2, Sparkles, UploadCloud, ImagePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCropQualityNotes } from '@/ai/flows/generate-crop-quality-notes';
import { generateCropImage } from '@/ai/flows/generate-crop-image';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import type { CropListing, User } from '@/lib/types';
import { addDoc, collection, doc } from 'firebase/firestore';

export default function NewListingPage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userRef = useMemoFirebase(
    () => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null),
    [firestore, authUser]
  );
  const { data: userProfile } = useDoc<User>(userRef);

  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);
  const [dataUris, setDataUris] = useState<(string | null)[]>([null, null, null]);
  const [qualityNotes, setQualityNotes] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cropType, setCropType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const { toast } = useToast();

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
        description:
          'Please upload at least the first crop image and select the crop type.',
      });
      return;
    }
    setIsLoadingNotes(true);
    setQualityNotes('');
    try {
      const result = await generateCropQualityNotes({
        cropPhotoDataUri: dataUris[0],
        cropType,
      });
      setQualityNotes(result.qualityNotes);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'AI Analysis Failed',
        description: 'Could not generate quality notes. Please try again.',
      });
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || !firestore || !userProfile || !cropType || !quantity || !price) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Form',
        description: 'Please fill out crop type, quantity, and price.',
      });
      return;
    }
    setIsSubmitting(true);
    
    let imagesToSave = dataUris.filter((uri): uri is string => !!uri);
    
    try {
      // If no images are provided, generate one automatically
      if (imagesToSave.length === 0) {
        toast({
            title: 'Generating Image',
            description: 'No images uploaded. Generating one for you with AI...',
        });
        const imageResult = await generateCropImage({ cropType });
        if(imageResult.imageUrl) {
            imagesToSave.push(imageResult.imageUrl);
        } else {
             throw new Error('AI image generation failed.');
        }
      }
        
      const newListing: Omit<CropListing, 'id'> = {
        farmerId: authUser.uid,
        cropType: cropType,
        quantity: Number(quantity),
        price: Number(price),
        location: userProfile.location || 'Unknown Location',
        city: userProfile.city || 'Unknown',
        country: userProfile.country || 'Unknown',
        images: imagesToSave,
        qualityNotes: qualityNotes,
        status: 'Listed',
        listingDate: new Date().toISOString(),
        aiVerified: qualityNotes !== '',
      };
      
      await addDoc(collection(firestore, 'crops'), newListing);
      
      toast({
        title: 'Listing Published!',
        description: `${cropType} has been listed on the marketplace.`,
      });

      router.push('/dashboard/farmer');
    } catch (error) {
      console.error("Error creating listing: ", error);
      const errorMessage = error instanceof Error ? error.message : 'Could not create the listing. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Create New Listing
        </h2>
        <p className="text-muted-foreground">
          Fill in the details below to list your crops on the marketplace.
        </p>
      </div>
      <form className="grid md:grid-cols-3 gap-8 items-start mt-6" onSubmit={handleSubmit}>
        <div className="md:col-span-2 grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Crop Details</CardTitle>
              <CardDescription>
                Provide the basic information about your produce.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cropType">Crop Type</Label>
                  <Select onValueChange={setCropType} value={cropType}>
                    <SelectTrigger id="cropType">
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
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
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="e.g., 10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price (per ton)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 250"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Crop Images</CardTitle>
              <CardDescription>
                Upload photos of your crop, or we'll generate one for you!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map(index => (
                  <div key={index} className="grid gap-2">
                    <Label
                      htmlFor={`crop-image-${index}`}
                      className="border-2 border-dashed border-muted-foreground/50 rounded-lg aspect-video flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent relative overflow-hidden"
                    >
                      {previews[index] ? (
                        <Image
                          src={previews[index]!}
                          alt={`Crop preview ${index + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <>
                          <ImagePlus className="w-10 h-10 text-muted-foreground" />
                          <span className="mt-2 text-sm font-semibold">
                            Upload Image {index + 1}
                          </span>
                        </>
                      )}
                      <Input
                        id={`crop-image-${index}`}
                        type="file"
                        className="sr-only"
                        onChange={(e) => handleFileChange(e, index)}
                        accept="image/*"
                      />
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
              <CardDescription>
                Generate quality notes from your first image to make your listing stand out.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button
                type="button"
                onClick={handleGenerateNotes}
                disabled={isLoadingNotes || !previews[0] || !cropType}
              >
                {isLoadingNotes ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate AI Notes
              </Button>
              <div className="grid gap-2">
                <Label htmlFor="quality-notes">AI Generated Notes</Label>
                <Textarea
                  id="quality-notes"
                  placeholder="Click 'Generate' to have our AI analyze your crop image..."
                  value={qualityNotes}
                  readOnly={isLoadingNotes}
                  onChange={(e) => setQualityNotes(e.target.value)}
                  rows={5}
                />
              </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Publish Listing
                      </>
                    )}
                </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </>
  );
}
