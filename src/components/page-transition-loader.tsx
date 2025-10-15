"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function PageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // We can't know for sure when the *new* page has started rendering,
    // so we'll start the loading indicator immediately on path change.
    setLoading(true);

    // However, we also can't know for sure when the new page has *finished*
    // rendering. A common and effective UX pattern is to assume the page
    // has loaded after a short, fixed delay. This prevents the loader from
    // disappearing jarringly fast on quick loads or getting stuck if
    // something unexpected happens.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 750); // This duration can be tuned.

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div
        className={`h-full bg-primary transition-all duration-700 ease-out ${
          loading ? "w-1/2" : "w-full"
        }`}
        style={{
            transitionProperty: 'width, opacity',
            opacity: loading ? 1 : 0,
        }}
      />
    </div>
  );
}
