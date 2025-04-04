/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";

const filterOptions = {
    "Bus Types": ["AC Deluxe", "Tourist AC Deluxe", "Air Suspension", "Luxury AC Deluxe"],
    "Bus Companies": ["Nhism Deluxe", "DoKhoa Deluxe", "Haiz Deluxe", "NhismdKhoaHaiz Deluxe"],
    "Amenities": ["Internet/Wifi", "AC & Air Suspension", "Water Bottles", "LED TV & Music", "Charging Port", "Fan", "Super AC"]
};

const Filter = ({ className }) => {
    const [priceRange, setPriceRange] = useState([1000, 3000]);
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
            {/* Price Filter */}
            <div className="border border-neutral-300 rounded-xl p-4 space-y-3">
                <h1 className="text-lg text-neutral-600 font-medium">Apply Filters</h1>
                <Slider 
                    defaultValue={priceRange}
                    min={1000}
                    max={3000}
                    step={100}
                    onValueChange={setPriceRange}
                    className="w-full"
                />
                <div className="flex justify-between text-sm text-neutral-800">
                    <span>₫{priceRange[0]}</span>
                    <span>₫{priceRange[1]}</span>
                </div>
            </div>
            
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