import HeroBanner from '../components/sections/HeroBanner'
import HighlightCards from '../components/sections/HighlightCards'
// import ContributionBanner from '../components/sections/ContributionBanner'
import SocialProjects from '../components/sections/SocialProjects'
import LatestNews from '../components/sections/LatestNews'
import ViveExperience from '../components/sections/ViveExperience'
// import TalentContacts from '../components/sections/TalentContacts'
import AdnSection from '../components/sections/AdnSection'

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <HighlightCards />
      {/* <TalentContacts /> */}
      <AdnSection />
      {/* <ContributionBanner /> */}
      <SocialProjects />
      <LatestNews />
      <ViveExperience /> 
    </>
  )
}
