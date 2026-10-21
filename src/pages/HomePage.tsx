import HeroBanner from '../components/sections/HeroBanner'
import HighlightCards from '../components/sections/HighlightCards'
// import ContributionBanner from '../components/sections/ContributionBanner'
import SocialProjects from '../components/sections/SocialProjects'
import LatestNews from '../components/sections/LatestNews'
import ViveExperience from '../components/sections/ViveExperience'
import TalentTestimonials from '../components/sections/TalentTestimonials'
import AdnSection from '../components/sections/AdnSection'

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <HighlightCards />
      <AdnSection />
      {/* <ContributionBanner /> */}
      <SocialProjects />
      <LatestNews />
      <ViveExperience /> 
      <TalentTestimonials />
    </>
  )
}
