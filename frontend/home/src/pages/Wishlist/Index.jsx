import { useEffect, useState, use } from 'react'
import { Link } from '@typeroute/router'
import { Breadcrumbs, Card, Button, Input, toast, Modal, Chip } from '@heroui/react'

import { Container, Section, Stack, FlexRow, CustomButton } from '../../components'
import { WishlistStore } from '../../stores/WishlistStore'
import { wishlistView, home } from '../../routes'

export default function Wishlist() {
  const [isCreating, setIsCreating] = useState(false)
  const [newListName, setNewListName] = useState('')

  const { wishlists: lists } = WishlistStore.use()

  const handleCreate = async () => {
    if (!newListName.trim()) return
    setIsCreating(true)
    const res = await WishlistStore.createList(newListName)
    setIsCreating(false)
    if (res && res.success) {
      toast.success('Wishlist created!')
      setNewListName('')
    } else {
      toast.danger(res?.message || 'Failed to create wishlist')
    }
  }

  const handleDelete = async (id) => {
    const res = await WishlistStore.deleteList(id)
    if (res && res.success) {
      toast.success('Wishlist deleted')
    } else {
      toast.danger('Failed to delete')
    }
  }

  const breadcrumbItems = [
    { label: 'Home', route: home },
    { label: 'Wishlist' }
  ]

  return (
    <Container className="relative max-w-7xl py-4">
      <Section>
        <Stack spacing={6}>
          <Breadcrumbs>
            { breadcrumbItems.map( ( item, index ) => (
              ! item.route ? <Breadcrumbs.Item key={ index } className="pointer-events-none">{ item.label }</Breadcrumbs.Item> :
              <Breadcrumbs.Item key={ index }>
                <Link to={ item.route } preload="intent">
                  { item.label }
                </Link>
              </Breadcrumbs.Item>
            ) ) }
          </Breadcrumbs>

          <div className="flex justify-between">
          <FlexRow className="flex-row items-center gap-2">
            <h1 className="text-2xl font-semibold">My Wishlists</h1>
            <Chip variant="primary" size="md" className="mt-1">
              { lists.length } lists of 10
            </Chip>
          </FlexRow>
          <Modal >
            <Button variant="primary">Create List</Button>
            <Modal.Backdrop variant="opaque">
              <Modal.Container size='xs'>
                <Modal.Dialog>
                  <Modal.Header>
                    <h2 className="text-lg font-medium">Create new wishlist</h2>
                  </Modal.Header>
                  <Modal.Body>
                    <Input
                      autoFocus
                      label="Wishlist Name"
                      placeholder="e.g. Gifts"
                      variant="secondary"
                      className='w-full'
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                    />
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="tertiary" slot="close">
                      Cancel
                    </Button>
                    <Button slot="close" variant="primary" onPress={handleCreate} isPending={isCreating}>
                      Create
                    </Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
          </div>
        </Stack>
      </Section>

      {lists.length === 0 ? (
        <div className="bg-default-100 p-8 text-center rounded-lg">
          <p className="text-default-500">You don't have any wishlists yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map(list => (
            <Card key={list.id} className="p-6">
              <h3 className="text-xl font-medium mb-2">{list.name}</h3>
              <p className="text-default-500 mb-6">{list?.items?.length || 0} items</p>

              <FlexRow className="justify-between items-center mt-auto">
                <CustomButton variant="secondary">
                  <Link to={ wishlistView } params={{ id: list.id }} preload="intent">View List</Link>
                </CustomButton>
                <Modal >
                  <Button variant="outline">Delete</Button>
                  <Modal.Backdrop variant="opaque">
                    <Modal.Container>
                      <Modal.Dialog>
                        <Modal.Header>
                          <h2 className="text-lg font-medium">Confirm Delete?</h2>
                        </Modal.Header>
                        <Modal.Body>
                          This will delete all the items in wishlist "<code>{ list.name }</code>". Are you sure you want to delete?
                        </Modal.Body>
                        <Modal.Footer>
                          <Button variant="tertiary" slot="close">
                            Cancel
                          </Button>
                          <Button slot="close" variant="danger" onPress={() => handleDelete(list.id)}>
                            Delete
                          </Button>
                        </Modal.Footer>
                      </Modal.Dialog>
                    </Modal.Container>
                  </Modal.Backdrop>
                </Modal>
              </FlexRow>
            </Card>
          ))}
        </div>
      )}
    </Container>
  )
}
