import React from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

const TopLayout = ({ bgImg, className }) => {
    return (
        <motion.div
            className={`w-full h-[60vh] bg-cover bg-no-repeat bg-center relative ${className}`}
            style={{ backgroundImage: `url(${bgImg})` }}
            initial={{ opacity: 0, y: -800 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -800 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
        />
    );
};

export default TopLayout;