'use client'

import { useState, useEffect, useRef } from 'react'

export default function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  onSelectAll,
  onClear,
  placeholder,
  displayNameMap,
}: {
  label: string
  options: string[]
  selectedValues: string[]
  onChange: (value: string) => void
  onSelectAll: (selectAll: boolean) => void
  onClear: () => void
  placeholder: string
  displayNameMap?: (key: string) => string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const allSelected = selectedValues.length === options.length && options.length > 0
  const someSelected = selectedValues.length > 0 && selectedValues.length < options.length
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = someSelected
    }
  }, [someSelected])

  const hasSelections = selectedValues.length > 0

  return (
    <div className="mb-3" ref={dropdownRef}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-medium text-gray-700">{label}</label>
        {hasSelections && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClear()
            }}
            className="text-xs text-gray-500 hover:text-gray-700 hover:underline transition-colors"
          >
            ล้างการกรอง
          </button>
        )}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-left flex items-center justify-between"
        >
          <span className="truncate text-xs">
            {selectedValues.length === 0 ? placeholder : `เลือกไว้ ${selectedValues.length} รายการ`}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
            <label className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer border-b border-gray-200">
              <input
                ref={selectAllCheckboxRef}
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="mr-2 h-3.5 w-3.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-gray-900">เลือกทั้งหมด</span>
            </label>
            {options.map((option) => {
              const displayName = displayNameMap ? displayNameMap(option) : option
              return (
                <label key={option} className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => onChange(option)}
                    className="mr-2 h-3.5 w-3.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-xs text-gray-700">{displayName}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
