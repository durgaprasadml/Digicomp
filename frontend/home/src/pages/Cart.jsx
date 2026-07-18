import { useEffect, useState } from 'react'
import { useLocation, Link } from '@typeroute/router'
import { Breadcrumbs, BreadcrumbsItem, Button, Card, NumberField, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Separator } from '@heroui/react'
import { home, shop, cart as cartRoute, product, checkout } from '../routes'
import { Container, CustomButton, FlexRow, Section, Stack } from '../components'
import { CartStore, useStore } from '../stores/CartStore'
import { PageStore } from '../stores/PageStore'

const CartIcon = ( { className='w-5' } ) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={ className }>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

export default function Cart() {
  const { cart } = useStore(CartStore)
  const [isFetching, setIsFetching] = useState(true)
  const pageData = PageStore.use()

  useEffect(() => {
    // Fetch fresh cart data on mount
    const loadCart = async () => {
      setIsFetching(true)
      await CartStore.fetchCart()
      setIsFetching(false)
    }
    loadCart()
  }, [])

  const handleUpdateQty = async (key, qty) => {
    if (qty < 1) return;
    await CartStore.updateCartItem(key, qty)
  }

  const handleRemove = async (key) => {
    await CartStore.removeCartItem(key)
  }

  const { items = [], storeApiData } = cart || {}
  const totals = storeApiData?.totals || null

  const breadcrumbItems = [
    { label: 'Home', route: home },
    { label: 'Shop', route: shop },
    { label: 'Cart' }
  ]

  return (
    <Container className='relative max-w-7xl py-4'>
      <Section>
          <Stack spacing={6}>
            <Breadcrumbs>
              {breadcrumbItems.map((item, index) => (
                ! item.route ? <BreadcrumbsItem key={index} className="pointer-events-none">{item.label}</BreadcrumbsItem> :
                <BreadcrumbsItem key={index}>
                  <Link to={item.route}>
                    {item.label}
                  </Link>
                </BreadcrumbsItem>
              ))}
            </Breadcrumbs>

            <FlexRow className="flex-row items-center gap-2">
              <h1 className="text-2xl font-semibold">Your Cart</h1>
              <Chip variant="primary" size="md" className="mt-1">
                { cart?.count } items
              </Chip>
            </FlexRow>
          </Stack>
      </Section>

      <Section className="pb-12">
        {items.length === 0 ? (
          <Card className="p-12 text-center items-center justify-center">
            <CartIcon className='w-24' />
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Browse our products and find something you like!</p>
            <CustomButton variant="primary" size="lg">
              <Link to={shop}>Start Shopping</Link>
            </CustomButton>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-2">
              <Table shadow="none" className="w-full ">
                <Table.ScrollContainer>
                  <Table.Content aria-label="Cart Items">
                    <TableHeader>
                      <TableColumn isRowHeader>Product</TableColumn>
                      <TableColumn>Price</TableColumn>
                      <TableColumn>Quantity</TableColumn>
                      <TableColumn>Total</TableColumn>
                      <TableColumn aria-label="Actions" />
                    </TableHeader>
                    <TableBody items={items}>
                      {(item) => (
                        <TableRow key={item.key}>
                          <TableCell>
                            <div className="flex items-center gap-4 py-2">
                              <div className="w-16 h-16 rounded-lg border flex items-center justify-center">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                                ) : (
                                  <span className="text-xs text-muted">No Img</span>
                                )}
                              </div>
                              <Link to={ product } params={{ slug: item.slug || item.id}} className="font-semibold line-clamp-2">
                                <span dangerouslySetInnerHTML={{ __html: item.name }} />
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">₹{item.price}</span>
                          </TableCell>
                          <TableCell>
                            <NumberField
                              value={item.qty}
                              onChange={(val) => handleUpdateQty(item.key, val)}
                              minValue={1}
                              aria-label="Quantity"
                              size="sm"
                              className="w-28 lg:w-32"
                            >
                              <NumberField.Group>
                                <NumberField.DecrementButton />
                                <NumberField.Input />
                                <NumberField.IncrementButton />
                              </NumberField.Group>
                            </NumberField>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold">
                              ₹{item.totals?.line_total ? (parseInt(item.totals.line_total) / 100).toFixed(2) : (item.price * item.qty).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button isIconOnly variant="ghost" aria-label="Remove item" onPress={() => handleRemove(item.key)}>✕</Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table.Content>
                </Table.ScrollContainer>
              </Table>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <Stack className="gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Subtotal ({cart.count} items)</span>
                    <span>
                      ₹{totals ? (parseInt(totals.total_items) / 100).toFixed(2) : items.reduce((sum, item) => sum + (item.price * item.qty), 0).toFixed(2)}
                    </span>
                  </div>

                  {totals && parseInt(totals.total_tax) > 0 && (
                    <div className="flex justify-between items-center">
                      <span>GST</span>
                      <span>₹{(parseInt(totals.total_tax) / 100).toFixed(2)}</span>
                    </div>
                  )}

                  {totals && (
                    <div className="flex justify-between items-center">
                      <span>Shipping</span>
                      { parseInt(totals.total_shipping) > 0 ? (
                        <span>₹{(parseInt(totals.total_shipping) / 100).toFixed(2)}</span>
                      ) : (
                        <span className="text-xs text-muted">(Next step)</span>
                      ) }
                    </div>
                  )}

                  <div className="my-2 border-t pt-4 flex justify-between items-start">
                    <span className="text-lg font-bold">Total</span>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-bold text-accent">
                        ₹{totals ? (parseInt(totals.total_price) / 100).toFixed(2) : items.reduce((sum, item) => sum + (item.price * item.qty), 0).toFixed(2)}
                      </span>
                      <span className="text-xs text-muted mt-1">Includes all taxes</span>
                    </div>
                  </div>
                </Stack>
                <CustomButton  size="lg" className="mt-4 w-full" isPending={isFetching}>
                  <Link to={ checkout } preload="intent">Proceed to Checkout</Link>
                </CustomButton>
              </Card>
            </div>
          </div>
        )}

      </Section>
    </Container>
  )
}
