import { SiteNavbar } from '../components/SiteNavbar'
import { SiteFooter } from '../components/SiteFooter'
import { HeroSection } from '../components/sections/HeroSection'
import { FeaturesSection } from '../components/sections/FeaturesSection'
import { PricingSection } from '../components/sections/PricingSection'
import { TestimonialsSection } from '../components/sections/TestimonialsSection'
import { CTASection } from '../components/sections/CTASection'
export const config = { render: 'static' }
export default function LandingPage() { return <><SiteNavbar /><HeroSection /><FeaturesSection /><PricingSection /><TestimonialsSection /><CTASection /><SiteFooter /></> }
