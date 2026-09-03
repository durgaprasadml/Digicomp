import { Modal } from '@heroui/react'
import { AuthTabs } from '../pages/Auth'

export default function AuthModalContent({ defaultTab, onClose }) {
  return (
    <Modal.Backdrop variant="opaque">
      <Modal.Container size="sm">
        <Modal.Dialog className="rounded-3xl p-2 border border-border bg-surface shadow-2xl">
          <Modal.CloseTrigger />
          <Modal.Body className="pt-4 pb-2 px-3 sm:px-5">
            <AuthTabs defaultTab={defaultTab} onSuccess={onClose} />
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}


