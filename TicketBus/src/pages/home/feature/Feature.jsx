/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Offer from '../../offer/Offer';

const Feature = () => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Run animation only once
    threshold: 0.2, // Trigger animation when 20% of the element is in view
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 800 }}
      animate={{ opacity: 1, y: -300 }}
      exit={{ opacity: 0, y: 800 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      className="w-full max-w-6xl mx-auto p-5 flex flex-col items-center justify-center space-y-6"
    >
      
        <Offer />
    </motion.div>
  );
};

export default Feature;
