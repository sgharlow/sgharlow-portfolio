import { loadEnrichedProjectsFile } from '@/lib/projects';
import { getTodaysSpotlight } from '@/lib/daily-spotlight';
import { SpotlightInterstitial } from '@/components/SpotlightInterstitial';

export const revalidate = 3600;

export default async function HomePage() {
  const file = await loadEnrichedProjectsFile();
  const now = new Date();
  const today = getTodaysSpotlight(file, now);
  return <SpotlightInterstitial entry={today} date={now} />;
}
