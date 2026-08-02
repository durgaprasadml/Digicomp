import { useRef, useEffect } from 'react'
import { AddToCart } from '../components'
import { CartStore } from '../stores/CartStore'

export const Default = () => {
  const dummyRef = useRef(null)
  return (
    <div className="p-4 w-64">
      <AddToCart handleAdd={() => console.log('Added')} imgRef={dummyRef} />
    </div>
  )
}

export const WithAnimation = () => {
  const imgRef = useRef(null)
  const cartRef = useRef(null)

  useEffect(() => {
    CartStore.setRef(cartRef)
    return () => CartStore.setRef(null)
  }, [])

  return (
    <div className="p-8 relative min-h-[400px]">
      {/* Mock Cart Icon at top right */}
      <div
        ref={cartRef}
        className="absolute top-4 right-4 w-12 h-12 bg-surface border border-border rounded-full flex items-center justify-center shadow-lg text-xl"
        title="Mock Cart"
      >
        🛒
      </div>

      {/* Mock Product Image & Button */}
      <div className="max-w-xs mt-20 border border-border rounded-xl p-4 bg-surface shadow-md">
        <div className="bg-default rounded-lg mb-4 flex items-center justify-center overflow-hidden h-48">
          <img
            ref={imgRef}
            src="https://picsum.photos/400/400?product"
            alt="Product"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-lg mb-2">Awesome Product</h3>
        <p className="text-sm text-muted mb-4">$49.99</p>
        <AddToCart handleAdd={() => console.log('Added to cart')} imgRef={imgRef} />
      </div>
    </div>
  )
}
