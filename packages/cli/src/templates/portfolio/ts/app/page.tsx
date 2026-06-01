import { HeroSection } from '../components/HeroSection'
import { ProjectsGrid } from '../components/ProjectsGrid'
import { SkillsBadges } from '../components/SkillsBadges'
import { ContactForm } from '../components/ContactForm'
export const config = { render: 'static' }
export default function PortfolioPage() { return <><HeroSection /><SkillsBadges /><ProjectsGrid /><ContactForm /></> }
