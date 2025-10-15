
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import {
  useAuth,
  useFirestore,
} from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  AuthError,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type AuthMode = 'login' | 'signup';
type UserRole = 'farmer' | 'retailer';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const [role, setRole] = useState<UserRole>((roleParam as UserRole) || 'farmer');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const loginImage = PlaceHolderImages.find(p => p.id === 'login-hero');

  const handleAuthAction = async () => {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Firebase not initialized',
        description: 'Please try again later.',
      });
      return;
    }
    setIsLoading(true);
    try {
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        const avatarPlaceholderId = role === 'farmer' ? 'user-farmer-avatar' : 'user-retailer-avatar';
        const avatarPlaceholder = PlaceHolderImages.find(p => p.id === avatarPlaceholderId);


        // Create user profile in Firestore
        await setDoc(doc(firestore, 'users', user.uid), {
          id: user.uid,
          name: name,
          role: role,
          email: user.email,
          location: 'Unknown',
          verification: 'New',
          reputation: 70,
          avatar: avatarPlaceholder?.imageUrl || '',
          avatarFallback: name.substring(0, 2).toUpperCase(),
        });
        toast({ title: 'Account created successfully!' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Logged in successfully!' });
      }
      router.push('/dashboard');
    } catch (error) {
      const authError = error as AuthError;
      console.error(authError);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: authError.message || 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md p-4">
          <Link href="/" className="flex items-center justify-center gap-2 mb-6" prefetch={false}>
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-headline text-foreground">
              AgriLink AI
            </span>
          </Link>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </CardTitle>
              <CardDescription>
                {authMode === 'login'
                  ? 'Enter your credentials to access your dashboard.'
                  : 'Fill in the details to get started.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {authMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Amanpreet Singh"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@agrilink.ai"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {authMode === 'signup' && (
                <div className="space-y-2">
                  <Label>I am a...</Label>
                  <RadioGroup
                    defaultValue={role}
                    onValueChange={(v: UserRole) => setRole(v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="farmer" id="farmer" />
                      <Label htmlFor="farmer">Farmer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="retailer" id="retailer" />
                      <Label htmlFor="retailer">Retailer</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                className="w-full"
                onClick={handleAuthAction}
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </Button>
              <Button
                variant="link"
                onClick={() =>
                  setAuthMode(authMode === 'login' ? 'signup' : 'login')
                }
              >
                {authMode === 'login'
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Login'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {loginImage && (
          <Image
            src={loginImage.imageUrl}
            alt="Image"
            fill
            className="object-cover dark:brightness-[0.3]"
            data-ai-hint={loginImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
      </div>
    </div>
  );
}
