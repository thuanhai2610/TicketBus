/* eslint-disable no-unused-vars */
import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Hero from './hero/Hero'
import Search from './hero/search/Search'
import Feature from './feature/Feature'  // New section
import Testimonial from './testimonial/Testimonial'  // New section
import BusHome from './bushome/BusHome'

const SectionWrapper = ({ children }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Run animation only once
    threshold: 0.2, // Trigger animation when 20% of the element is in view
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

const Home = () => {
  return (
    <div className="space-y-16 w-full h-auto pb-16">
      {/* Hero */}
      <SectionWrapper>
        <Hero />
      </SectionWrapper>

      {/* Search */}
      <SectionWrapper>
      <Search  />
      </SectionWrapper>

      {/* Feature Section */}
      <SectionWrapper>
        <Feature />
      </SectionWrapper>

      {/* Testimonial Section */}
      <SectionWrapper>
        <Testimonial />
      </SectionWrapper>

      <SectionWrapper>
        <BusHome/> 
      </SectionWrapper>
    </div>
  )
}

export default Home
