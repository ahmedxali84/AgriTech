import { Leaf, LucideProps } from "lucide-react";

export const Icons = {
  logo: (props: LucideProps) => (
    <Leaf {...props} />
  ),
  verified: (props: LucideProps) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21.08 11.15c.53.8.23 1.84-.6 2.46l-4.08 2.81c-.4.28-.93.28-1.32 0l-4.08-2.81c-.83-.62-1.13-1.66-.6-2.46l2.16-3.29c.39-.6.13-1.39-.53-1.69l-4.09-1.8a1.5 1.5 0 0 1-.8-1.92l1.32-3.95C9.37 1.43 10.16.8 11 .8h2c.84 0 1.63.63 1.88 1.48l1.32 3.95a1.5 1.5 0 0 1-.8 1.92l-4.09 1.8c-.66.3-.92 1.09-.53 1.69l2.16 3.29Z"></path>
      <path d="m9 12.5 2 2 4-4"></path>
    </svg>
  )
};
