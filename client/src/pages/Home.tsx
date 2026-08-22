import Hero from '../components/Hero'
import AboutSection from '../components/AboutSection'
import ServicesSection from '../components/ServicesSection'
import LearningOptions from '../components/LearningOptions'
import SafeguardingBand from '../components/SafeguardingBand'
import WhyTestimonials from '../components/WhyTestimonials'
import HowItWorks from '../components/HowItWorks'
import CTASection from '../components/CTASection'

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <ServicesSection />
      <LearningOptions />
      <SafeguardingBand />
      <WhyTestimonials />
      <HowItWorks />
      <CTASection />
    </>
  )
}