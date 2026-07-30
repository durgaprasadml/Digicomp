import { useEffect, useState, use } from 'react'
import { Link, useLocation, useNavigate } from '@typeroute/router'
import { Card, Button, Table, Input, TextField, toast, Select, ListBox } from "@heroui/react"

import { viewOrder, login, home, shop } from '../../routes'
import { PageStore } from '../../stores/PageStore'
import { UserStore } from '../../stores/UserStore'
import { FlexRow, Stack, CustomButton } from '../../components'
import { getCleanPath } from '../../utils/helper'
import { updateCustomer, updateAccountDetails, logout } from '../../utils/api'

const ValidatedInput = ({ isInvalid, ...props }) => (
  <TextField isInvalid={isInvalid} className="w-full">
    <Input fullWidth {...props} />
  </TextField>
)

function DashboardView({ user }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    await UserStore.refreshData()
    navigate( { to: home } )
  }

  return (
    <Stack spacing={4}>
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <p>Hello <strong>{user?.display_name}</strong> (not {user?.display_name}? <button onClick={ handleLogout } className="cursor-pointer underline">Logout</button>)</p>
      <p className="text-muted text-sm">
        From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
      </p>
    </Stack>
  )
}

function OrdersView({ orders }) {
  if (!orders || orders.length === 0) {
    return (
      <Stack spacing={4}>
        <h2 className="text-xl font-semibold">Orders</h2>
        <div className="bg-default-100 p-8 text-center rounded-lg">
          <p className="text-default-500 mb-4">No order has been made yet.</p>
          <Link to={ shop } preload="intent">
            <Button variant="solid" color="primary">Browse products</Button>
          </Link>
        </div>
      </Stack>
    )
  }

  return (
    <Stack spacing={4}>
      <h2 className="text-xl font-semibold">Orders</h2>
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Recent orders">
            <Table.Header>
              <Table.Column>Order</Table.Column>
              <Table.Column>Date</Table.Column>
              <Table.Column>Status</Table.Column>
              <Table.Column>Total</Table.Column>
              <Table.Column>Actions</Table.Column>
            </Table.Header>
            <Table.Body>
              {orders.map(order => (
                <Table.Row key={order.id}>
                  <Table.Cell>
                    <Link to={ viewOrder } params={{ id: order.id }} preload="intent" className="text-primary font-medium">#{ order.order_number }</Link>
                  </Table.Cell>
                  <Table.Cell className="text-default-600">{order.date}</Table.Cell>
                  <Table.Cell>
                    <span className="bg-default-100 px-2 py-1 rounded text-sm text-default-700">{order.status}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span dangerouslySetInnerHTML={{ __html: order.total }} />
                  </Table.Cell>
                  <Table.Cell>
                    <CustomButton size="sm">
                      <Link to={ viewOrder } params={{ id: order.id }} preload="intent">View</Link>
                    </CustomButton>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </Stack>
  )
}


function OrderDetailsView({ order }) {
  if (!order) return <p>Order not found.</p>;

  return (
    <Stack spacing={4}>
      <FlexRow className="justify-between items-center">
        <h2 className="text-xl font-semibold">Order #{order.order_number}</h2>
        <span className="bg-default-100 px-3 py-1.5 rounded-md text-sm text-default-700 font-medium">
          {order.status}
        </span>
      </FlexRow>
      <p className="text-muted text-sm">Placed on {order.date}</p>
      <div className='text-sm'>
        {order.shipping_method && (
          <div className='mb-4'>
            <span className="text-muted">Shipping Method: </span>
            <span className="font-medium">{order.shipping_method}</span>
          </div>
        ) }
        { ( order.payment_title || order.payment_method ) && (
          <div className='mb-4'>
            <span className="text-muted">Payment Method: </span>
            <span className="font-medium">{ order.payment_title || order.payment_method }</span>
          </div>
        ) }
        { order.transaction_id && (
          <div className='mb-4'>
            <span className="text-muted">Transaction ID:</span>
            <span className="font-medium">{ order.transaction_id }</span>
          </div>
        ) }
      </div>

      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Order items">
            <Table.Header>
              <Table.Column>Product</Table.Column>
              <Table.Column>Quantity</Table.Column>
              <Table.Column>Total</Table.Column>
            </Table.Header>
            <Table.Body>
              {order.items.map((item, idx) => (
                <Table.Row key={idx}>
                  <Table.Cell className="font-medium">{item.name}</Table.Cell>
                  <Table.Cell>{item.quantity}</Table.Cell>
                  <Table.Cell>
                    <span dangerouslySetInnerHTML={{ __html: item.total }} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <div className="flex justify-end pt-6">
        <div className="w-full max-w-sm grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-right">
          {order.total_tax > 0 && (
            <>
              <span className="text-muted">Tax:</span>
              <span className="font-medium" dangerouslySetInnerHTML={{ __html: order.total_tax }} />
            </>
          )}
          <span className="text-muted mt-2 text-base">Total:</span>
          <span className="text-xl font-semibold mt-1" dangerouslySetInnerHTML={{ __html: order.total }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Billing address</h3>
          <address className="not-italic text-sm" dangerouslySetInnerHTML={{ __html: order.billing_address || 'No billing address.' }} />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium">Shipping address</h3>
          <address className="not-italic text-sm" dangerouslySetInnerHTML={{ __html: order.shipping_address || 'No shipping address.' }} />
        </Card>
      </div>
    </Stack>
  )
}

function DownloadsView({ downloads }) {
  return (
    <Stack spacing={4}>
      <h2 className="text-xl font-semibold">Downloads</h2>
      <div className="bg-default-100 p-8 text-center rounded-lg">
        <p className="text-default-500">No downloads available yet.</p>
      </div>
    </Stack>
  )
}

function AddressesView({ billing, shipping }) {
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  const handleEdit = (type, data) => {
    setEditing(type)
    setFormData(data || {})
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCopy = () => {
    const sourceData = editing === 'billing' ? shipping : billing
    // When copying, we want to copy all address fields.
    // If copying from shipping to billing, it might not have email. That's fine, we merge into prev.
    setFormData(prev => ({ ...prev, ...sourceData }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const payload = editing === 'billing' ? { billing_address: formData } : { shipping_address: formData }
    const updated = await updateCustomer(payload)
    if (updated) {
      toast.success('Address updated successfully')
      setEditing(null)
    } else {
      toast.danger('Failed to update address')
    }
    setIsSaving(false)
  }

  const renderEditForm = (type) => (
    <div className="h-full flex flex-col">
      <FlexRow className="justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Edit {type === 'billing' ? 'Billing' : 'Shipping'} address</h3>
        <Button size="sm" variant="flat" onPress={handleCopy}>
          Copy from {type === 'billing' ? 'Shipping' : 'Billing'}
        </Button>
      </FlexRow>
      <div className="grid grid-cols-1 gap-4 flex-1">
        <ValidatedInput placeholder="First Name" name="first_name" value={formData.first_name || ''} onChange={handleChange} variant="bordered" />
        <ValidatedInput placeholder="Last Name" name="last_name" value={formData.last_name || ''} onChange={handleChange} variant="bordered" />
        <ValidatedInput placeholder="Company" name="company" value={formData.company || ''} onChange={handleChange} variant="bordered" />
        <ValidatedInput placeholder="Address 1" name="address_1" value={formData.address_1 || ''} onChange={handleChange} variant="bordered" />
        <ValidatedInput placeholder="Address 2" name="address_2" value={formData.address_2 || ''} onChange={handleChange} variant="bordered" />
        <ValidatedInput placeholder="City" name="city" value={formData.city || ''} onChange={handleChange} variant="bordered" />
        <div className="flex gap-4">
          <ValidatedInput placeholder="State" name="state" value={formData.state || ''} onChange={handleChange} variant="bordered" />
          <ValidatedInput placeholder="Postcode" name="postcode" value={formData.postcode || ''} onChange={handleChange} variant="bordered" />
        </div>
        <ValidatedInput placeholder="Country" name="country" value={formData.country || ''} onChange={handleChange} variant="bordered" />
        {type === 'billing' && (
           <ValidatedInput placeholder="Email" name="email" value={formData.email || ''} onChange={handleChange} variant="bordered" />
        )}
        <ValidatedInput placeholder="Phone" name="phone" value={formData.phone || ''} onChange={handleChange} variant="bordered" />
      </div>
      <div className="flex gap-4 mt-6 pt-4 border-t border-default-200">
        <Button color="primary" onPress={handleSave} isLoading={isSaving}>Save</Button>
        <Button variant="flat" onPress={() => setEditing(null)} isDisabled={isSaving}>Cancel</Button>
      </div>
    </div>
  )

  return (
    <Stack spacing={4}>
      <FlexRow className="justify-between items-center">
        <h2 className="text-xl font-semibold">Addresses</h2>
      </FlexRow>
      <p className="text-muted text-sm">
        The following addresses will be used on the checkout page by default.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 items-stretch">
        <Card className="p-6">
          {editing === 'billing' ? renderEditForm('billing') : (
            <>
              <FlexRow className="justify-between items-center">
                <h3 className="text-lg font-medium">Billing address</h3>
                <Button size="sm" variant="light" color="primary" onPress={() => handleEdit('billing', billing)}>Edit</Button>
              </FlexRow>
              <address className="not-italic text-default-600 leading-relaxed text-sm">
                {billing?.first_name} {billing?.last_name}<br/>
                {billing?.company && <>{billing?.company}<br/></>}
                {billing?.address_1}<br/>
                {billing?.address_2 && <>{billing?.address_2}<br/></>}
                {billing?.city}{billing?.city && billing?.state ? ', ' : ''}{billing?.state} {billing?.postcode}<br/>
                {billing?.country}
                {billing?.phone && <><br/>{billing?.phone}</>}
              </address>
            </>
          )}
        </Card>

        <Card className="p-6">
          {editing === 'shipping' ? renderEditForm('shipping') : (
            <>
              <FlexRow className="justify-between items-center">
                <h3 className="text-lg font-medium">Shipping address</h3>
                <Button size="sm" variant="light" color="primary" onPress={() => handleEdit('shipping', shipping)}>Edit</Button>
              </FlexRow>
              <address className="not-italic text-default-600 leading-relaxed text-sm">
                {shipping?.first_name} {shipping?.last_name}<br/>
                {shipping?.company && <>{shipping?.company}<br/></>}
                {shipping?.address_1}<br/>
                {shipping?.address_2 && <>{shipping?.address_2}<br/></>}
                {shipping?.city}{shipping?.city && shipping?.state ? ', ' : ''}{shipping?.state} {shipping?.postcode}<br/>
                {shipping?.country}
                {shipping?.phone && <><br/>{shipping?.phone}</>}
              </address>
            </>
          )}
        </Card>
      </div>
    </Stack>
  )
}
function AccountDetailsView({ user }) {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    display_name: user?.display_name || ''
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e) => {
    setFormData(prev => ({ ...prev, display_name: e.target.value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateAccountDetails(formData)
    if (result && result.success) {
      toast.success('Account details updated successfully')
    } else {
      toast.danger('Failed to update account details')
    }
    setIsSaving(false)
  }

  // Display name options
  const displayNameOptions = []
  if (user?.username) displayNameOptions.push(user.username)
  if (formData.first_name) displayNameOptions.push(formData.first_name)
  if (formData.last_name) displayNameOptions.push(formData.last_name)
  if (formData.first_name && formData.last_name) {
    displayNameOptions.push(`${formData.first_name} ${formData.last_name}`)
    displayNameOptions.push(`${formData.last_name} ${formData.first_name}`)
  }
  const uniqueOptions = [...new Set(displayNameOptions)].filter(Boolean)

  return (
    <Stack spacing={4}>
      <h2 className="text-xl font-semibold">Account Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-default-700">First name</label>
          <ValidatedInput name="first_name" value={formData.first_name} onChange={handleChange} variant="bordered" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-default-700">Last name</label>
          <ValidatedInput name="last_name" value={formData.last_name} onChange={handleChange} variant="bordered" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1.5 text-default-700">Display name</label>
          <Select
            selectedKey={formData.display_name}
            onSelectionChange={(key) => setFormData(prev => ({ ...prev, display_name: key }))}
            aria-label="Display name"
          >
            <Select.Trigger className="w-full">
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox items={uniqueOptions.map(opt => ({ id: opt, name: opt }))}>
                {(item) => <ListBox.Item id={item.id}>{item.name}</ListBox.Item>}
              </ListBox>
            </Select.Popover>
          </Select>
          <p className="text-xs text-default-400 mt-1">This will be how your name will be displayed in the account section and in reviews.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-default-700">Username</label>
          <ValidatedInput type="text" value={user?.username || ''} readOnly isDisabled variant="bordered" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-default-700">Email address</label>
          <ValidatedInput type="email" value={user?.email || ''} readOnly isDisabled variant="bordered" />
        </div>
      </div>

      <div className="mt-4">
        <Button color="primary" onPress={handleSave} isLoading={isSaving}>Save changes</Button>
      </div>
    </Stack>
  )
}
export default function MyAccount() {
  const { user } = UserStore.use()
  const navigate = useNavigate()
  const { path } = useLocation()

  const page = getCleanPath(path)

  const parts = page.split('/')
  const tab = parts.length > 1 ? parts[1] : 'dashboard'

  PageStore.use()
  let accountData = PageStore.get().pages[page]

  // Conditional use() to fetch if we don't have the data
  // Checking againt undefined is important as logged out user returns null
  if ( undefined === accountData?.user ) {
    accountData = use( PageStore.fetch( page, { waitNonce: true } ) )
  }

  // Clear cache on unmount so fresh data is loaded on next visit
  useEffect( () => {
    return () => {
      PageStore.set( old => ( { ...old, pages: { ...old.pages, [page]: null } } ) )
    }
  }, [page] )

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user?.is_logged_in) {
      navigate({ to: login, state: { from: path } })
    }
  }, [user, navigate, path])

  if (!user?.is_logged_in) {
    return null // Render nothing while redirecting
  }

  return (
    <main className="flex-1 min-w-0">
      {tab === 'dashboard' && <DashboardView user={accountData?.user} />}
      {tab === 'orders' && <OrdersView orders={accountData?.orders} />}
      {tab === 'view-order' && <OrderDetailsView order={accountData?.order} />}
      {tab === 'downloads' && <DownloadsView downloads={accountData?.downloads} />}
      {tab === 'edit-address' && <AddressesView billing={accountData?.billing_address} shipping={accountData?.shipping_address} />}
      {tab === 'edit-account' && <AccountDetailsView user={accountData?.user} />}
    </main>
  )
}
