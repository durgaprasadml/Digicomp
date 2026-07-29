import { useEffect, useState, use } from 'react'
import { Link, useLocation } from '@typeroute/router'
import { Button, toast, Breadcrumbs } from '@heroui/react'

import { WishlistStore } from '../../stores/WishlistStore'
import { Container, Section, FlexRow, Stack } from '../../components'
import { product as productRoute, home, wishlist as wishlistRoute } from '../../routes'
import ProductGrid from '../../blocks/ProductGrid'

let cache = new Map()

export default function WishlistView() {
  const { path } = useLocation()
  const id = path.split('/').filter(Boolean).pop()

  const data = use( ( () => {
    if ( ! cache.has( id )) {
      cache.set( id, WishlistStore.fetchWishlist( id ) )
    }
    return cache.get( id )
  } )() )

  useEffect( () => {
    return () => cache.delete( id )
  }, [] )

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  if ( ! data?.wishlist ) {
    return (
      <Container className="py-8 max-w-7xl">
        <h1 className="text-3xl font-semibold mb-6">Wishlist Not Found</h1>
        <p>This wishlist doesn't exist or has been deleted.</p>
      </Container>
    )
  }

  const { wishlist, products } = data

  const breadcrumbItems = [
    { label: 'Home', route: home },
    { label: 'Wishlists', route: wishlistRoute },
    { label: wishlist.name }
  ]

  return (
    <Container className="relative max-w-7xl py-4">
      <Section>
        <Stack spacing={6}>
          <Breadcrumbs>
            { breadcrumbItems.map( ( item, index ) => (
              ! item.route ? <Breadcrumbs.Item key={ index } className="pointer-events-none">{ item.label }</Breadcrumbs.Item> :
              <Breadcrumbs.Item key={ index }>
                <Link to={ item.route }>
                  { item.label }
                </Link>
              </Breadcrumbs.Item>
            ) ) }
          </Breadcrumbs>

          <FlexRow className="justify-between items-center">
            <h1 className="text-2xl font-semibold">{ wishlist.name }</h1>
            <Button variant="outline" onPress={ handleShare }>Share Link</Button>
          </FlexRow>
        </Stack>
      </Section>

      {products.length === 0 ? (
        <div className="bg-default-100 p-8 text-center rounded-lg">
          <p className="text-default-500">This wishlist is empty.</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </Container>
  )
}
