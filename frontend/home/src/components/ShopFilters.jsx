import { useState, useRef, useEffect } from 'react'

function DualRangeSlider({ min, max, value, onChange }) {
  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), value[1] - 1);
    onChange([val, value[1]]);
  };
  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), value[0] + 1);
    onChange([value[0], val]);
  };

  const percentMin = ((value[0] - min) / (max - min)) * 100 || 0;
  const percentMax = ((value[1] - min) / (max - min)) * 100 || 0;

  return (
    <div className="mt-4 px-2 pb-6">
      <div className="relative w-full h-1.5 bg-[var(--surface)] rounded-full">
        <div 
          className="absolute h-1.5 bg-[var(--color-accent-start)] rounded-full" 
          style={{ left: `${percentMin}%`, right: `${100 - percentMax}%` }} 
        />
        <input 
          type="range" 
          min={min} 
          max={max} 
          value={value[0]} 
          onChange={handleMinChange}
          className="absolute w-full -top-1.5 h-4 opacity-0 cursor-pointer pointer-events-auto" 
        />
        <input 
          type="range" 
          min={min} 
          max={max} 
          value={value[1]} 
          onChange={handleMaxChange}
          className="absolute w-full -top-1.5 h-4 opacity-0 cursor-pointer pointer-events-auto" 
        />
        <div 
          className="absolute w-4 h-4 bg-[var(--text)] rounded-full -top-1.5 shadow pointer-events-none transition-transform hover:scale-110"
          style={{ left: `calc(${percentMin}% - 8px)` }}
        />
        <div 
          className="absolute w-4 h-4 bg-[var(--text)] rounded-full -top-1.5 shadow pointer-events-none transition-transform hover:scale-110"
          style={{ left: `calc(${percentMax}% - 8px)` }}
        />
      </div>
    </div>
  );
}

function ChevronDown({ isOpen }) {
  return (
    <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  )
}

function Accordion({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[var(--border)] py-4">
      <button 
        className="flex w-full items-center justify-between font-semibold text-[var(--text)] hover:text-[var(--color-accent-start)] transition-colors cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <ChevronDown isOpen={isOpen} />
      </button>
      <div className={`mt-3 space-y-2 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 overflow-y-auto' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  )
}

function CheckboxList({ options, selected, onChange }) {
  return options.map(option => {
    const isChecked = selected.includes(option)
    return (
      <label key={option} className="flex items-center gap-3 cursor-pointer group">
        <input 
          type="checkbox" 
          className="hidden" 
          checked={isChecked} 
          onChange={() => onChange(option)} 
        />
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-[var(--color-accent-start)] border-[var(--color-accent-start)]' : 'border-[var(--border)] group-hover:border-[var(--color-accent-start)]'}`}>
          {isChecked && (
            <svg className="w-3 h-3 text-[var(--bg)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>
        <span className={`text-sm ${isChecked ? 'text-[var(--text)] font-medium' : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'}`}>
          {option}
        </span>
      </label>
    )
  })
}

export default function ShopFilters({ filtersData, activeFilters, setActiveFilters, minPrice, maxPrice, currency }) {
  const toggleArrayItem = (array, item) => 
    array.includes(item) ? array.filter(i => i !== item) : [...array, item]

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-[var(--text)]">Filters</h2>
        <button 
          onClick={() => setActiveFilters({ categories: [], tags: [], brands: [], attributes: {}, price: [minPrice, maxPrice], inStockOnly: true })}
          className="text-xs text-[var(--color-accent-start)] hover:underline cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Stock Status */}
      <div className="py-4 border-b border-[var(--border)]">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            className="hidden" 
            checked={activeFilters.inStockOnly} 
            onChange={() => setActiveFilters(prev => ({ ...prev, inStockOnly: !prev.inStockOnly }))} 
          />
          <div className={`w-10 h-5 rounded-full transition-colors relative ${activeFilters.inStockOnly ? 'bg-[var(--color-accent-start)]' : 'bg-[var(--surface)] border border-[var(--border)]'}`}>
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--text)] transition-transform ${activeFilters.inStockOnly ? 'translate-x-5 bg-[var(--bg)]' : ''}`} />
          </div>
          <span className="text-sm font-semibold text-[var(--text)]">In Stock Only</span>
        </label>
      </div>

      {/* Categories */}
      {filtersData?.categories?.length > 0 && (
        <Accordion title="Categories">
          <CheckboxList 
            options={filtersData.categories} 
            selected={activeFilters.categories} 
            onChange={(cat) => setActiveFilters(prev => ({ ...prev, categories: toggleArrayItem(prev.categories, cat) }))} 
          />
        </Accordion>
      )}

      {/* Brands */}
      {filtersData?.brands?.length > 0 && (
        <Accordion title="Brands">
          <CheckboxList 
            options={filtersData.brands} 
            selected={activeFilters.brands} 
            onChange={(brand) => setActiveFilters(prev => ({ ...prev, brands: toggleArrayItem(prev.brands, brand) }))} 
          />
        </Accordion>
      )}

      {/* Dynamic Attributes (Processor, RAM, etc) */}
      {Object.entries(filtersData?.attributes || {}).map(([attrName, options]) => (
        options.length > 0 && (
          <Accordion key={attrName} title={attrName} defaultOpen={false}>
            <CheckboxList 
              options={options} 
              selected={activeFilters.attributes[attrName] || []} 
              onChange={(val) => {
                const current = activeFilters.attributes[attrName] || []
                setActiveFilters(prev => ({
                  ...prev,
                  attributes: {
                    ...prev.attributes,
                    [attrName]: toggleArrayItem(current, val)
                  }
                }))
              }} 
            />
          </Accordion>
        )
      ))}

      {/* Tags */}
      {filtersData?.tags?.length > 0 && (
        <Accordion title="Tags" defaultOpen={false}>
          <CheckboxList 
            options={filtersData.tags} 
            selected={activeFilters.tags} 
            onChange={(tag) => setActiveFilters(prev => ({ ...prev, tags: toggleArrayItem(prev.tags, tag) }))} 
          />
        </Accordion>
      )}

      {/* Price */}
      <Accordion title="Price Range">
        <DualRangeSlider 
          min={minPrice} 
          max={maxPrice} 
          value={activeFilters.price} 
          onChange={(newVal) => setActiveFilters(p => ({ ...p, price: newVal }))} 
        />
        <div className="flex items-center gap-2 mt-2">
          <input 
            type="number" 
            value={activeFilters.price[0]} 
            onChange={e => setActiveFilters(p => ({ ...p, price: [Number(e.target.value), p.price[1]] }))}
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1.5 text-sm text-[var(--text)] outline-none focus:border-[var(--color-accent-start)] text-center"
          />
          <span className="text-[var(--text-muted)]">-</span>
          <input 
            type="number" 
            value={activeFilters.price[1]} 
            onChange={e => setActiveFilters(p => ({ ...p, price: [p.price[0], Number(e.target.value)] }))}
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1.5 text-sm text-[var(--text)] outline-none focus:border-[var(--color-accent-start)] text-center"
          />
        </div>
      </Accordion>

    </div>
  )
}
