import Hero from '../components/Hero'
import UpcomingEvents from '../components/UpcomingEvents'
import AboutSection from '../components/AboutSection'
import ServicesSection from '../components/ServicesSection'
import LearningOptions from '../components/LearningOptions'
import SafeguardingBand from '../components/SafeguardingBand'
import WhyTestimonials from '../components/WhyTestimonials'
import HowItWorks from '../components/HowItWorks'
import CTASection from '../components/CTASection'
import { Reveal } from '../motion'

export default function Home() {
  return (
    <>
      <Hero />
      {/* Directly under the collage: a parent scanning the homepage should see
          that things actually happen here before they read what Axis is. The
          section removes itself entirely once nothing is coming up. */}
      <UpcomingEvents />
      <AboutSection />
      <ServicesSection />
      <LearningOptions />
      {/* These two are the only sections here with no animation of their own;
          the rest already use framer-motion and wrapping those would animate
          them twice. Reveal renders its children plainly until it knows they
          are below the fold, so nothing on first paint moves. */}
      <Reveal>
        <SafeguardingBand />
      </Reveal>
      <WhyTestimonials />
      <Reveal>
        <HowItWorks />
      </Reveal>
      <CTASection />
    </>
  )
}