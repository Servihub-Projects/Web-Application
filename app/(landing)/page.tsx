import HeroSection from "./sections/hero";
import StatsBar from "./sections/stats-bar";
import Categories from "./sections/categories";
import HowItWorks from "./sections/how-it-works";
import FeaturedProviders from "./sections/featured-providers";
import Features from "./sections/features";
import Testimonials from "./sections/testimonials";
import ProviderCTA from "./sections/provider-cta";
import WaitlistInline from "./sections/waitlist-inline";
import { FAQ } from "./sections/faq";

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <StatsBar />
      <Categories />
      <HowItWorks />
      <FeaturedProviders />
      <Features />
      <Testimonials />
      <ProviderCTA />
      <WaitlistInline />
      <FAQ />
    </main>
  );
}
