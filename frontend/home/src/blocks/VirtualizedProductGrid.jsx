import { useState, useEffect, useRef } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { CartStore } from '../stores/CartStore';
import { PageStore } from '../stores/PageStore';

import { ProductCard } from '../components'

export default function VirtualizedProductGrid({ products }) {
  const listRef = useRef(null)

  // Responsive Columns
  const [cols, setCols] = useState(4)
  useEffect(() => {
    const calcCols = () => {
      if (window.innerWidth >= 1024) return 4
      if (window.innerWidth >= 640) return 2
      return 1
    }
    const onResize = () => setCols(calcCols())
    onResize() // Init
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Create Virtual Rows
  const rows = []
  for (let i = 0; i < products.length; i += cols) {
    rows.push(products.slice(i, i + cols))
  }

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 400, // Card height + gap
    overscan: 4,
    scrollMargin: listRef.current?.offsetTop ?? 0,
    initialRect: { width: 1920, height: 1080 }
  })

  return (
    <div ref={listRef} style={{ width: '100%', position: 'relative' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const rowProducts = rows[virtualRow.index]
          return (
            <div
              key={virtualRow.index}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: '20px', // Matches the gap-5 visual spacing
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 gap-x-4"
            >
              {rowProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
