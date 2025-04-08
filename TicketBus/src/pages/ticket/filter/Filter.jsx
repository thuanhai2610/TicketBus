/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import Banner from "../../../assets/banner.jpg"

const Filter = ({ className }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: -175 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`w-full ${className}`}
        >
            <img
                src={Banner}
                alt="Banner"
                className="w-full h-auto  object-cover"
            />
        </motion.div>
    );
};

export default Filter;
