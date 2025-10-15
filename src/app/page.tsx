
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  HeartHandshake,
  BrainCircuit,
  Leaf,
  Store,
  UploadCloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Icons } from '@/components/icons';

const featureCards = [
  {
    icon: <Icons.verified className="size-10 text-primary" />,
    title: 'AI-Verified Quality',
    description:
      'Our AI analyzes crop photos to provide unbiased quality notes, building a foundation of trust for every transaction.',
  },
  {
    icon: <HeartHandshake className="size-10 text-primary" />,
    title: 'Fair & Smart Deals',
    description:
      'Negotiate with confidence. Our AI assistant helps suggest fair counteroffers and summarizes agreements clearly.',
  },
  {
    icon: <BrainCircuit className="size-10 text-primary" />,
    title: 'Actionable Insights',
    description:
      'Leverage AI-driven analytics on market trends and pricing to make smarter, more profitable business decisions.',
  },
];

const testimonials = [
  {
    name: 'Amanpreet Singh',
    role: 'Farmer, Punjab',
    avatar:
      PlaceHolderImages.find(img => img.id === 'testimonial1')?.imageUrl || '',
    avatarFallback: 'AS',
    text: 'For the first time, I feel my hard work is truly seen. The AI verification gives me the credibility to demand a fair price, and I have found buyers I never could have reached before. AgriLink AI has honored my craft.',
  },
  {
    name: 'Riya Gupta',
    role: 'Retailer, Delhi',
    avatar:
      PlaceHolderImages.find(img => img.id === 'testimonial2')?.imageUrl || '',
    avatarFallback: 'RG',
    text: 'Trust is everything in this business. Sourcing used to be a gamble. Now, with AI-verified quality and transparent farmer profiles, I buy with absolute confidence. It has saved me time, money, and countless headaches.',
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2" prefetch={false}>
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-headline text-foreground">
              AgriLink AI
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/market">Marketplace</Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative flex h-[90vh] min-h-[700px] w-full items-center justify-center">
          <div className="absolute inset-0 bg-black/50 z-0"></div>
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt="A farmer holding soil in their hands in a lush field"
              fill
              className="object-cover -z-10"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="container relative mx-auto px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="fade-in-up">
                 <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl font-headline text-shadow-lg">
                  The Heartbeat of the Harvest,
                  <br />
                  <span className="text-green-200">Powered by Intelligence.</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-200 md:text-xl text-shadow">
                  We connect dedicated farmers with discerning retailers, building a
                  fairer, more transparent food supply chain through the power of
                  AI.
                </p>
                <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                  <Button
                    size="lg"
                    asChild
                    className="transform shadow-lg transition-all duration-300 hover:-translate-y-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Link href="/login?role=farmer">
                      I'm a Farmer <Leaf className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="secondary" asChild className="transform shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <Link href="/login?role=retailer">
                      I'm a Retailer <Store className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-16 md:py-24 bg-accent/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl font-headline">
                A Marketplace Built on Trust
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Farming is an act of faith. Buying produce shouldn't be. We use
                technology to bring clarity, fairness, and humanity back into
                the trade.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {featureCards.map((feature, index) => (
                <div key={index} className="fade-in-up flex flex-col items-center p-6 text-center transition-all duration-300 hover:bg-card hover:shadow-lg rounded-lg" style={{animationDelay: `${index * 150}ms`}}>
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                     {feature.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-bold font-headline">{feature.title}</h3>
                  <p className="mx-auto max-w-xs text-base text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section id="testimonials" className="w-full py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl font-headline">
                From the Heart of the Community
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Don't just take our word for it. Hear from the people whose lives we're changing.
              </p>
            </div>
             <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-1 lg:grid-cols-2">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="transform border-none bg-card shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <CardContent className="flex h-full flex-col items-start p-8">
                      <p className="mb-6 flex-grow text-lg italic text-foreground/80">
                        "{testimonial.text}"
                      </p>
                       <div className="flex w-full items-center gap-4 border-t border-border pt-6">
                         <Avatar className="h-16 w-16 border-2 border-primary/50">
                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                            <AvatarFallback>{testimonial.avatarFallback}</AvatarFallback>
                          </Avatar>
                           <div>
                              <div className="text-lg font-bold font-headline">{testimonial.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {testimonial.role}
                              </div>
                           </div>
                       </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </section>

         <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold sm:text-4xl font-headline">Join the Future of Agriculture</h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
                    Become part of a community that values fairness, quality, and connection.
                </p>
                <Button size="lg" variant="secondary" asChild className="mt-8 transform shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <Link href="/login">Get Started Today <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
            </div>
        </section>
      </main>

      <footer className="bg-accent/30">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-6 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <Icons.logo className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} AgriLink AI. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
              prefetch={false}
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
              prefetch={false}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
