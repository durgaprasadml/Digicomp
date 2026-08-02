import { useState } from 'react';
import { Button } from '@heroui/react';

import { Drawer } from '../components'
const DrawerContent  = () => <div className="p-6 flex flex-col h-full bg-surface">
  <div className="flex-1">
    <h2 className="text-xl font-bold mb-4">Drawer Content</h2>
    <p className="mb-4">This is the content inside the custom drawer.</p>
    <p>You can drag this drawer to close it, or click the backdrop.</p>
  </div>
  <div className="pt-4 border-t border-border">
    <Button className="w-full" color="danger" onPress={() => setIsOpen(false)}>
      Close Drawer
    </Button>
  </div>
</div>

export const Basic = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Right Drawer</h1>
      <p className="mb-8 text-gray-600">Click the button or swipe from the right edge to open.</p>

      <Button color="primary" onPress={() => setIsOpen(true)}>
        Open Right Drawer
      </Button>

      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
        position="right"
        swipeToOpen={true}
        className="w-80"
      >
        <DrawerContent />
      </Drawer>
    </div>
  );
};

export const LeftPosition = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Left Drawer</h1>
      <p className="mb-8 text-gray-600">Click the button or swipe from the left edge to open.</p>

      <Button color="secondary" onPress={() => setIsOpen(true)}>
        Open Left Drawer
      </Button>

      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
        position="left"
        swipeToOpen={true}
        className="w-80"
      >
        <DrawerContent />
      </Drawer>
    </div>
  );
};
