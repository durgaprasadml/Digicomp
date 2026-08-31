import { Modal } from '@heroui/react'
import { AuthTabs } from '../pages/Auth'

export default function AuthModalContent({ defaultTab }) {
  return (
    <Modal.Backdrop variant="opaque">
      <Modal.Container size="sm">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <h2 className="text-lg font-medium">{defaultTab === 'login' ? 'Welcome Back' : 'Create an Account'}</h2>
          </Modal.Header>
          <Modal.Body>
             <AuthTabs defaultTab={defaultTab} />
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

