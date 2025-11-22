'use client'

import React from 'react'

interface TimeRangeSelectorProps {
  selected: 'day' | 'week' | 'month'
  onChange: (range: 'day' | 'week' | 'month') => void
}

export default function TimeRangeSelector({ selected, onChange }: TimeRangeSelectorProps) {
  const options: { value: 'day' | 'week' | 'month'; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ]

  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            selected === option.value
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

