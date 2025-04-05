/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";

const filterOptions = {
    "Bus Types": ["Xe Khách Giường Nằm", "Xe Khách Ghế Ngồi"],
};

const Filter = ({ className }) => {
    const [selectedFilters, setSelectedFilters] = useState({});

    const handleCheckboxChange = (category, option) => {
        setSelectedFilters(prev => {
            const updatedCategory = prev[category] ? [...prev[category]] : [];
            if (updatedCategory.includes(option)) {
                return { ...prev, [category]: updatedCategory.filter(item => item !== option) };
            } else {
                return { ...prev, [category]: [...updatedCategory, option] };
            }
        });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: -175 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`w-full space-y-6 ${className}`}
        >
            {/* Other Filters */}
            {Object.entries(filterOptions).map(([category, options], idx) => (
                <div key={idx} className="border border-neutral-300 rounded-xl p-4 space-y-3">
                    <h1 className="text-lg text-neutral-600 font-medium">{category}</h1>
                    <div className="space-y-2.5">
                        {options.map((option, i) => (
                            <label key={i} className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="h-3.5 w-3.5 cursor-pointer" 
                                    checked={selectedFilters[category]?.includes(option) || false}
                                    onChange={() => handleCheckboxChange(category, option)}
                                />
                                <span className="text-sm text-neutral-600">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
        </motion.div>
    );
};

export default Filter;