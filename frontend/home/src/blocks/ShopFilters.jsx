import { useState } from 'react';
import { Accordion, CheckboxGroup, Checkbox, Switch, Button, Input } from '@heroui/react'

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
    <div className="mt-6 px-2 pb-4 -mx-1.5">
      <div className="relative mt-4 h-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={handleMinChange}
          className="absolute w-full [-webkit-appearance: none] appearance-none bg-transparent pointer-events-none z-[2]"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={handleMaxChange}
          className="absolute w-full [-webkit-appearance: none] appearance-none bg-transparent pointer-events-none z-[2]"
        />
        <div className="relative w-full h-1.5 bg-[var(--border)] rounded-md">
          <div
            className="absolute h-1.5 bg-gradient-to-l from-(--accent) to-(--color-accent-hover) rounded-md"
            style={{ left: `calc(${percentMin}%)`, right: `calc(${100 - percentMax}%)` }}
          />
        </div>
      </div>
    </div>
  );
}

function renderCheckboxGroup(title, options, selectedValues, onChange, disabledValues = []) {
  if (!options || options.length === 0) return null;
  return (
    <Accordion.Item key={title} id={title}>
      <Accordion.Trigger className="flex items-center justify-between w-full">
        {title}
        <Accordion.Indicator />
      </Accordion.Trigger>
      <Accordion.Panel>
        <Accordion.Body>
          <CheckboxGroup value={ (disabledValues?.includes(options?.[0]) ) ? options : selectedValues} onChange={onChange}>
            {options.map(opt => (
              <Checkbox key={opt} value={opt} isDisabled={disabledValues?.includes(opt)}>
                <Checkbox.Content className="flex items-center gap-2">
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  {opt}
                </Checkbox.Content>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </Accordion.Body>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

export default function ShopFilters({ filtersData, activeFilters, setActiveFilters, minPrice, maxPrice, currency, disabledFilters = {} }) {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold ml-1">Filters</h2>
        <Button
          size="sm"
          variant="light"
          color="primary"
          onPress={() => setActiveFilters({ categories: [], tags: [], brands: [], attributes: {}, acf: {}, price: [minPrice, maxPrice], inStockOnly: true })}
        >
          Clear All
        </Button>
      </div>

      <Accordion defaultExpandedKeys={['Stock', 'Categories', 'Brands', 'Price Range']} allowsMultipleExpanded >
        <Accordion.Item key="Stock" id="Stock">
          <Accordion.Trigger className="flex items-center justify-between w-full">
            Stock
            <Accordion.Indicator />
          </Accordion.Trigger>
          <Accordion.Panel>
            <Accordion.Body>
              <Switch
                isSelected={activeFilters.inStockOnly}
                onChange={(isSelected) => setActiveFilters(prev => ({ ...prev, inStockOnly: isSelected }))}
                className="pt-2"
              >
                <Switch.Content className="flex items-center gap-2">
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  In Stock
                </Switch.Content>
              </Switch>
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
        {renderCheckboxGroup(
          'Categories',
          filtersData?.categories,
          activeFilters.categories,
          (values) => setActiveFilters(prev => ({ ...prev, categories: values })),
          disabledFilters.categories
        )}

        {renderCheckboxGroup(
          'Brands',
          filtersData?.brands,
          activeFilters.brands,
          (values) => setActiveFilters(prev => ({ ...prev, brands: values })),
          disabledFilters.brands
        )}

        {Object.entries(filtersData?.attributes || {}).map(([attrName, options]) => (
          renderCheckboxGroup(
            attrName,
            options,
            activeFilters.attributes?.[attrName] || [],
            (values) => setActiveFilters(prev => ({ ...prev, attributes: { ...prev.attributes, [attrName]: values } }))
          )
        ))}

        {Object.entries(filtersData?.acf || {}).map(([acfName, options]) => (
          renderCheckboxGroup(
            acfName.charAt(0).toUpperCase() + acfName.slice(1).replace('_', ' '),
            options,
            activeFilters.acf?.[acfName] || [],
            (values) => setActiveFilters(prev => ({ ...prev, acf: { ...prev.acf, [acfName]: values } }))
          )
        ))}

        {renderCheckboxGroup(
          'Tags',
          filtersData?.tags,
          activeFilters.tags,
          (values) => setActiveFilters(prev => ({ ...prev, tags: values })),
          disabledFilters.tags
        )}

        {/* Price */}
        <Accordion.Item key="Price Range" id="Price Range">
          <Accordion.Trigger className="flex items-center justify-between w-full">
            Price Range
            <Accordion.Indicator />
          </Accordion.Trigger>
          <Accordion.Panel>
            <Accordion.Body>
              <div className="overflow-hidden ">
                <DualRangeSlider
                  min={minPrice}
                  max={maxPrice}
                  value={activeFilters.price}
                  onChange={(newVal) => setActiveFilters(p => ({ ...p, price: newVal }))}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  aria-label="Min Price"
                  value={activeFilters.price[0]}
                  onChange={e => setActiveFilters(p => ({ ...p, price: [Number(e.target.value), p.price[1]] }))}
                  className="max-w-24"
                />
                <span className="text-muted">-</span>
                <Input
                  type="number"
                  aria-label="Max Price"
                  value={activeFilters.price[1]}
                  onChange={e => setActiveFilters(p => ({ ...p, price: [p.price[0], Number(e.target.value)] }))}
                  className="max-w-24"
                />
              </div>
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}
