/* eslint-disable no-unused-vars */
import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Hero from './hero/Hero'
import Search from './hero/search/Search'
import Offer from '../offer/Offer'
import Blog from '../blog/Blog'

const SectionWrapper = ({ children }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Chỉ chạy animation một lần
    threshold: 0.2, // Khi 20% phần tử xuất hiện
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
    <div className="space-y-16 w-full min-h-screen pb-16">
      {/* Hero */}
      <SectionWrapper>
        <Hero />
      </SectionWrapper>

      {/* Search */}
      <SectionWrapper>
        <Search />
      </SectionWrapper>

      {/* Services */}
      <SectionWrapper>
        <Offer />
      </SectionWrapper>

      {/* Top Search */}
      <SectionWrapper>
        <Blog />
      </SectionWrapper>
    </div>
  )
}

export default Home
