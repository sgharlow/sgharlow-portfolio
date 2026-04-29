import type { NextConfig } from "next";

const TRAINING = "https://training.learningai365.com";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/paths/:slug*", destination: `${TRAINING}/paths/:slug*`, permanent: true },
      { source: "/courses/:slug*", destination: `${TRAINING}/courses/:slug*`, permanent: true },
      { source: "/categories/:slug*", destination: `${TRAINING}/categories/:slug*`, permanent: true },
      { source: "/topics/:slug*", destination: `${TRAINING}/topics/:slug*`, permanent: true },
      { source: "/skills/:slug*", destination: `${TRAINING}/skills/:slug*`, permanent: true },
      { source: "/use-cases/:slug*", destination: `${TRAINING}/use-cases/:slug*`, permanent: true },
      { source: "/providers/:slug*", destination: `${TRAINING}/providers/:slug*`, permanent: true },
      { source: "/quiz", destination: `${TRAINING}/quiz`, permanent: true },
      { source: "/quiz/:path*", destination: `${TRAINING}/quiz/:path*`, permanent: true },
      // /about is now served by the portfolio (see app/about/page.tsx); no redirect.
      { source: "/faq", destination: `${TRAINING}/faq`, permanent: true },
      { source: "/privacy", destination: `${TRAINING}/privacy`, permanent: true },
      { source: "/terms", destination: `${TRAINING}/terms`, permanent: true },
      { source: "/daily-specials/:slug*", destination: `${TRAINING}/daily-specials/:slug*`, permanent: true },
    ];
  },
};

export default nextConfig;
