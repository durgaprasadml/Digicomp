import { useState, useMemo } from 'react'
import { useLocation, Link } from '@typeroute/router'
import { Breadcrumbs, BreadcrumbsItem, Select, Button, Card, ListBox, Chip } from '@heroui/react'

import { home, shop } from '../routes'
import { usePageData } from '../stores/PageStore'
import { Container, Drawer, FlexRow } from '../components'
import VirtualizedProductGrid from '../blocks/VirtualizedProductGrid'
import ShopFilters from '../blocks/ShopFilters'

const sortOptions = [
 { value: 'newest', label: 'Newest Arrivals' },
 { value: 'priceAsc', label: 'Price: Low to High' },
 { value: 'priceDesc', label: 'Price: High to Low' },
 { value: 'nameAsc', label: 'Name: A to Z' },
 { value: 'nameDesc', label: 'Name: Z to A' },
]

export default function Shop() {
 const { path } = useLocation()
 const { products = [], filters = {}, priceMin = 0, priceMax = 99999, heading = 'Shop' } = usePageData(path) || {}

 const [activeFilters, setActiveFilters] = useState({
  categories: [],
  tags: [],
  brands: [],
  attributes: {},
  acf: {},
  price: [priceMin, priceMax],
  inStockOnly: true
 })
 const [sortOrder, setSortOrder] = useState('newest') // newest, priceAsc, priceDesc, nameAsc
 const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

 const disabledFilters = { categories: [], tags: [], brands: [] }
 const breadcrumbItems = [
  { label: 'Home', route: home }
 ]

 if (path.startsWith('/product-category/')) {
  const termName = heading.replace('Category: ', '')
  disabledFilters.categories.push(termName)
  breadcrumbItems.push({ label: 'Shop', route: shop })
  breadcrumbItems.push({ label: termName })
 } else if (path.startsWith('/product-tag/')) {
  const termName = heading.replace('Tag: ', '')
  disabledFilters.tags.push(termName)
  breadcrumbItems.push({ label: 'Shop', route: shop })
  breadcrumbItems.push({ label: termName })
 } else if (path.startsWith('/brand/')) {
  const termName = heading.replace('Brand: ', '')
  disabledFilters.brands.push(termName)
  breadcrumbItems.push({ label: 'Shop', route: shop })
  breadcrumbItems.push({ label: termName })
 } else {
  breadcrumbItems.push({ label: 'Shop' })
 }

 // Memoized Filter & Sort
 const filteredProducts = useMemo(() => {
  let result = products.filter(p => {
   // Stock
   if (activeFilters.inStockOnly && p.stock !== 'instock') return false

   // Price
   const price = parseFloat(p.price || 0)
   if (price < activeFilters.price[0] || price > activeFilters.price[1]) return false

   // Categories
   if (activeFilters.categories.length > 0 && !activeFilters.categories.some(c => p.categories?.includes(c))) return false

   // Brands
   if (activeFilters.brands.length > 0 && !activeFilters.brands.some(b => p.brands?.includes(b))) return false

   // Tags
   if (activeFilters.tags.length > 0 && !activeFilters.tags.some(t => p.tags?.includes(t))) return false

   // Attributes
   if (activeFilters.attributes) {
    for (const [attrName, selectedValues] of Object.entries(activeFilters.attributes)) {
     if (selectedValues.length > 0) {
      const productAttrValues = p.attributes?.[attrName] || []
      if (!selectedValues.some(v => productAttrValues.includes(v))) return false
     }
    }
   }

   // ACF Fields
   if (activeFilters.acf) {
    for (const [acfName, selectedValues] of Object.entries(activeFilters.acf)) {
     if (selectedValues.length > 0) {
      const productAcfValues = p.acf?.[acfName] || []
      if (!selectedValues.some(v => productAcfValues.includes(v))) return false
     }
    }
   }

   return true
  })

  // Sort
  result.sort((a, b) => {
    if (sortOrder === 'priceAsc') return parseFloat(a.price || 0) - parseFloat(b.price || 0)
    if (sortOrder === 'priceDesc') return parseFloat(b.price || 0) - parseFloat(a.price || 0)
    if (sortOrder === 'nameAsc') return a.name.localeCompare(b.name)
    if (sortOrder === 'nameDesc') return b.name.localeCompare(a.name)
    // default: newest
    return (b.date || 0) - (a.date || 0)
  })

  return result
 }, [products, activeFilters, sortOrder])

 return (
  <Container className="relative max-w-7xl py-4">

   {/* Top Bar */}
   <Breadcrumbs className="mb-4">
    { breadcrumbItems.map( ( item, index ) => (
     ! item.route ? <BreadcrumbsItem key={ index } className="pointer-events-none">{ item.label }</BreadcrumbsItem> :
     <BreadcrumbsItem key={ index } render={ ( props ) => (
      <Link { ...props } to={ item.route } params={ item.params || undefined } preload="intent"></Link>
     ) }>
      { item.label }
     </BreadcrumbsItem>
    ) ) }
   </Breadcrumbs>

   <FlexRow className="sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border)]">
    <FlexRow className="flex-row items-center gap-2">
     <h1 className="text-2xl font-semibold">{heading}</h1>
     <Chip variant="primary" size="md" className="mt-1">
      { filteredProducts.length } results
     </Chip>
    </FlexRow>
    <FlexRow className="flex-row items-center gap-3 justify-between">
     <Button
      variant="outline"
      onPress={() => setIsMobileFiltersOpen(true)}
      className="lg:hidden bg-surface"
     >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
      </svg>
      Filters
     </Button>
     <Select
      value={sortOrder}
      onChange={(key) => setSortOrder(key)}
      className="w-48"
      aria-label="Sort by"
     >
      <Select.Trigger>
       <Select.Value />
       <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
       <ListBox items={sortOptions}>
        {(opt) => <ListBox.Item id={opt.value} textValue={opt.label}>{opt.label}</ListBox.Item>}
       </ListBox>
      </Select.Popover>
     </Select>
    </FlexRow>
   </FlexRow>

   <FlexRow className="items-start relative gap-8">

    {/* Desktop Sidebar */}
    <aside className="hidden lg:block w-64 shrink-0 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
     <ShopFilters
      filtersData={filters}
      activeFilters={activeFilters}
      setActiveFilters={setActiveFilters}
      minPrice={priceMin}
      maxPrice={priceMax}
      disabledFilters={disabledFilters}
     />
    </aside>

    {/* Mobile Filters Modal */}
    <Drawer
      isOpen={isMobileFiltersOpen}
      onClose={() => setIsMobileFiltersOpen(false)}
      onOpen={() => setIsMobileFiltersOpen(true)}
      position="left"
      swipeToOpen={true}
      className="w-80"
    >
      <div className="flex flex-col h-full bg-[var(--surface)]">
        <div className="p-4">
          <Button variant="ghost" isIconOnly onPress={() => setIsMobileFiltersOpen(false)} aria-label="Close" className="absolute top-0 right-0">✕</Button>
        </div>
        <div className="flex-1 py-4 px-2 overflow-y-auto">
          <ShopFilters
            filtersData={filters}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
            minPrice={priceMin}
            maxPrice={priceMax}
            disabledFilters={disabledFilters}
          />
        </div>
        <div className="p-4 border-t border-[var(--border)]">
          <Button color="primary" className="w-full font-bold" onPress={() => setIsMobileFiltersOpen(false)}>
            Show {filteredProducts.length} Results
          </Button>
        </div>
      </div>
    </Drawer>

    {/* Product Grid Area */}
    <div className="flex-1 w-full min-w-0">
     {filteredProducts.length === 0 ? (
      <div className="py-20 text-center flex flex-col items-center justify-center">
       <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text--muted mb-4">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <circle cx="11" cy="11" r="8"></circle>
         <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
       </div>
       <h3 className="text-xl font-bold mb-2">No products found</h3>
       <p className="text-muted max-w-sm mb-4">Try adjusting your filters or search terms to find what you're looking for.</p>
       <Button
        variant="outline"
        onPress={() => setActiveFilters({ categories: [], tags: [], brands: [], attributes: {}, acf: {}, price: [priceMin, priceMax], inStockOnly: true })}
       >
        Clear all filters
       </Button>
      </div>
     ) : (
      <VirtualizedProductGrid products={filteredProducts} />
     )}
    </div>
   </FlexRow>
  </Container>
 )
}
