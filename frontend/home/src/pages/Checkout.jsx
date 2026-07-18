import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@typeroute/router'
import { Breadcrumbs, BreadcrumbsItem, Button, Card, Input, RadioGroup, Radio, Description, Checkbox, toast, TextField } from '@heroui/react'
import { fetchCheckout, processCheckout, updateCustomer } from '../utils/api'
import { CartStore } from '../stores/CartStore'
import { UserStore } from '../stores/UserStore'
import { Container, Section, Stack, FlexRow } from '../components'
import { home, cart as cartRoute, checkout } from '../routes'

const ValidatedInput = ({ isInvalid, ...props }) => (
  <TextField isInvalid={isInvalid} className="w-full">
    <Input fullWidth {...props} />
  </TextField>
)

export default function Checkout() {
  const { cart } = CartStore.use()
  const { user, nonce } = UserStore.use()
  const navigate = useNavigate()

  const [checkoutData, setCheckoutData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [formErrors, setFormErrors] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    address_1: '',
    city: '',
    state: '',
    postcode: '',
    country: 'IN',
    phone: ''
  })

  const [billingFormData, setBillingFormData] = useState({
    first_name: '',
    last_name: '',
    address_1: '',
    city: '',
    state: '',
    postcode: '',
    country: 'IN',
    phone: ''
  })

  const [sameAsShipping, setSameAsShipping] = useState(true)

  const [selectedShipping, setSelectedShipping] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('')
  const [showAddressForm, setShowAddressForm] = useState(false)

  useEffect(() => {
    if (!nonce) return;

    const initCheckout = async () => {
      //setLoading(true)
      const data = await fetchCheckout()
      if (data) {
        setCheckoutData(data)

        if (data.billing_address || data.shipping_address) {
          setFormData(prev => ({
            ...prev,
            ...data.shipping_address
          }))
          setBillingFormData(prev => ({
            ...prev,
            ...data.billing_address
          }))
        }

        const sRates = data.shipping_rates
        if (sRates?.length > 0 && sRates[0].shipping_rates?.length > 0) {
          setSelectedShipping(sRates[0].shipping_rates[0].rate_id)
        }
      }
      //setLoading(false)
    }
    initCheckout()
  }, [nonce])

  useEffect(() => {
    if (cart?.items && cart.items.length === 0 && !loading) {
      navigate({ to: cartRoute })
    }
  }, [cart, loading, navigate])

  const payment_methods = checkoutData?.payment_methods || []

  useEffect(() => {
    if (payment_methods?.length > 0 && !selectedPayment) {
      setSelectedPayment(payment_methods[0].id)
    }
  }, [payment_methods, selectedPayment])

  const { items = [] } = cart || {}
  const totals = checkoutData?.totals || null
  const shippingRates = checkoutData?.shipping_rates || []

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBillingInputChange = (e) => {
    const { name, value } = e.target
    setBillingFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdateAddress = async () => {
    const updated = await updateCustomer({
      billing_address: sameAsShipping ? formData : billingFormData,
      shipping_address: formData
    })
    if (updated) {
      setCheckoutData(prev => ({ ...prev, ...updated }))
      const sRates = updated.shipping_rates
      if (sRates?.length > 0 && sRates[0].shipping_rates?.length > 0) {
          // Keep existing selection if valid, else fallback
          setSelectedShipping(sRates[0].shipping_rates[0].rate_id)
      }
    }
  }

  const handlePayNow = async () => {
    const required = ['first_name', 'last_name', 'address_1', 'city', 'state', 'postcode', 'phone']
    if (!user?.is_logged_in) required.push('email')
    const isValid = (data) => required.every(f => data[f] && data[f].trim() !== '')

    if (!isValid(formData) || (!sameAsShipping && !isValid(billingFormData))) {
      setFormErrors(true)
      toast.danger("Please fill in all required address fields.")
      return
    }
    setFormErrors(false)

    setProcessing(true)
    const order = await processCheckout({
      billing_address: sameAsShipping ? formData : billingFormData,
      shipping_address: formData,
      payment_method: selectedPayment
    })
    setProcessing(false)
    if (order && order.order_id) {
      toast.success("Order placed successfully!")
      await CartStore.fetchCart()
      navigate({ to: home })
    } else {
      toast.danger(order?.message || "Checkout failed. Please check your details.")
    }
  }

  const breadcrumbItems = [
    { label: 'Cart', route: cartRoute },
    { label: 'Secure Checkout' }
  ]

  if (loading) {
    return (
      <Container className='relative max-w-7xl py-12 flex justify-center items-center min-h-[50vh]'>
        <div className="w-8 h-8 border-4 border-t-transparent border-[var(--color-accent-start)] rounded-full animate-spin"></div>
      </Container>
    )
  }

  return (
    <Container className='relative max-w-7xl py-4 pb-16'>
      <Section>
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
      </Section>

      <div className="grid lg:grid-cols-3 gap-8 items-start mt-6">

          {/* Left Column */}
          <div className="lg:col-span-2">
            <Stack spacing={8}>

              {/* Contact Information */}
              <div>
                {user?.is_logged_in ? (
                  <div className="flex flex-row items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold border border-border">
                      {((user.first_name || formData.first_name)?.[0] || 'U')}
                      {((user.last_name || formData.last_name)?.[0] || '')}
                    </div>
                    <p>{user.email || formData.email}</p>
                  </div>
                ) : (
                  <ValidatedInput placeholder="Email Address" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} variant="bordered" isInvalid={formErrors && !formData.email?.trim()} />
                )}
              </div>

              {/* Shipping Address */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3>Shipping Address</h3>
                  {user?.is_logged_in && !showAddressForm && (
                    <Button size="sm" variant="flat" onPress={() => setShowAddressForm(true)}>Edit Address</Button>
                  )}
                  {showAddressForm && (
                    <div className="flex gap-2">
                      <Button size="sm" variant='primary' onPress={() => {
                        handleUpdateAddress();
                        setShowAddressForm(false);
                      }}>Save Address</Button>
                      <Button size="sm" variant='outline' onPress={() => setShowAddressForm(false)}>Cancel</Button>
                    </div>
                  )}
                </div>
                {user?.is_logged_in && !showAddressForm ? (
                  <Card className="text-sm gap-1">
                    <p className="font-semibold">{formData.first_name} {formData.last_name}</p>
                    <p>{formData.address_1}</p>
                    <p>{formData.city}, {formData.state}, {formData.country}, {formData.postcode}</p>
                    <p>{formData.phone}</p>
                  </Card>
                ) : (
                  <Stack spacing={4}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ValidatedInput placeholder="First Name" name="first_name" value={formData.first_name || ''} onChange={handleInputChange} variant="bordered" isInvalid={formErrors && !formData.first_name?.trim()} />
                      <ValidatedInput placeholder="Last Name" name="last_name" value={formData.last_name || ''} onChange={handleInputChange} variant="bordered" isInvalid={formErrors && !formData.last_name?.trim()} />
                    </div>
                    <ValidatedInput placeholder="Address" name="address_1" value={formData.address_1 || ''} onChange={handleInputChange} variant="bordered" isInvalid={formErrors && !formData.address_1?.trim()} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ValidatedInput placeholder="City" name="city" value={formData.city || ''} onChange={handleInputChange} variant="bordered" isInvalid={formErrors && !formData.city?.trim()} />
                      <ValidatedInput placeholder="State" name="state" value={formData.state || ''} onChange={handleInputChange} variant="bordered" isInvalid={formErrors && !formData.state?.trim()} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ValidatedInput placeholder="PIN Code" name="postcode" value={formData.postcode || ''} onChange={handleInputChange} variant="bordered" isInvalid={formErrors && !formData.postcode?.trim()} />
                      <ValidatedInput placeholder="Phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} variant="bordered" isInvalid={formErrors && !formData.phone?.trim()} />
                    </div>
                  </Stack>
                )}
              </div>

              {/* Billing Address */}
              <div>
                <h3 className="mb-4">Billing Address</h3>
                <Checkbox
                  isSelected={sameAsShipping}
                  onChange={() => setSameAsShipping(!sameAsShipping)}
                  className="mb-4"
                >
                  <Checkbox.Content>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    Same as shipping address
                  </Checkbox.Content>
                </Checkbox>

                {!sameAsShipping && (
                  <Stack spacing={4} className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ValidatedInput placeholder="First Name" name="first_name" value={billingFormData.first_name || ''} onChange={handleBillingInputChange} variant="bordered" isInvalid={formErrors && !billingFormData.first_name?.trim()} />
                      <ValidatedInput placeholder="Last Name" name="last_name" value={billingFormData.last_name || ''} onChange={handleBillingInputChange} variant="bordered" isInvalid={formErrors && !billingFormData.last_name?.trim()} />
                    </div>
                    <ValidatedInput placeholder="Address" name="address_1" value={billingFormData.address_1 || ''} onChange={handleBillingInputChange} variant="bordered" isInvalid={formErrors && !billingFormData.address_1?.trim()} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ValidatedInput placeholder="City" name="city" value={billingFormData.city || ''} onChange={handleBillingInputChange} variant="bordered" isInvalid={formErrors && !billingFormData.city?.trim()} />
                      <ValidatedInput placeholder="State" name="state" value={billingFormData.state || ''} onChange={handleBillingInputChange} variant="bordered" isInvalid={formErrors && !billingFormData.state?.trim()} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ValidatedInput placeholder="PIN Code" name="postcode" value={billingFormData.postcode || ''} onChange={handleBillingInputChange} variant="bordered" isInvalid={formErrors && !billingFormData.postcode?.trim()} />
                      <ValidatedInput placeholder="Phone" name="phone" value={billingFormData.phone || ''} onChange={handleBillingInputChange} variant="bordered" isInvalid={formErrors && !billingFormData.phone?.trim()} />
                    </div>
                  </Stack>
                )}
              </div>

              {/* Shipping Method */}
              {shippingRates.length > 0 && shippingRates[0].shipping_rates?.length > 0 && (
                <div>
                  <h3 className="mb-4">Shipping Method</h3>
                  <Card className="shadow-sm">
                    <RadioGroup value={selectedShipping} onChange={(val) => {
                        const v = typeof val === 'string' ? val : val?.target?.value;
                        if (v) setSelectedShipping(v);
                      }}>
                      {shippingRates[0].shipping_rates.map( (rate, i) => (
                        <Radio key={rate.rate_id} value={rate.rate_id} className={ i === 0 ? 'mt-0' : '' }>
                          <Radio.Content>
                            <Radio.Control>
                              <Radio.Indicator />
                            </Radio.Control>
                            {rate.name}
                          </Radio.Content>
                          <Description>{`₹${(parseInt(rate.price) / 100).toFixed(2)}`}</Description>
                        </Radio>
                      ))}
                    </RadioGroup>
                  </Card>
                </div>
              )}

              {/* Payment Method */}
              <div>
                <h3 className="mb-4">Payment Method</h3>
                <Card className="shadow-sm">
                  {payment_methods.length > 0 ? (
                    <RadioGroup value={selectedPayment} onChange={(val) => {
                        const v = typeof val === 'string' ? val : val?.target?.value;
                        if (v) setSelectedPayment(v);
                      }}>
                      {payment_methods.map( ( method, i ) => (
                        <Radio key={method.id} value={method.id} className={ i === 0 ? 'mt-0' : '' }>
                          <Radio.Content>
                            <Radio.Control>
                              <Radio.Indicator />
                            </Radio.Control>
                            {method.title}
                          </Radio.Content>
                          <Description>{method.description}</Description>
                        </Radio>
                      ))}
                    </RadioGroup>
                  ) : (
                    <p className="text-sm">No payment methods available.</p>
                  )}
                </Card>
              </div>
            </Stack>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1 p-6 lg:p-8 rounded-3xl sticky top-24 border border-border">
            <h3 className="mb-4">Order Summary</h3>

            <div className="space-y-4 mb-4 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.map(item => (
                <div key={item.key} className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain p-1" />
                    ) : (
                      <span className="text-xs">No Img</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm line-clamp-2 leading-tight">{item.name} x {item.qty}</span>
                  </div>
                  <div className="font-medium text-sm">
                    ₹{item.totals?.line_total ? (parseInt(item.totals.line_total) / 100).toFixed(2) : (item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="my-4 border-b border-border" />

            <Stack className="gap-3 text-sm">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
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
                    <span>Free</span>
                  )}
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
            <Button color="primary" size="lg" className="mt-4 w-full" onPress={handlePayNow} isLoading={processing}>
              Pay Now
            </Button>
          </div>

        </div>
      </Container>
  )
}
