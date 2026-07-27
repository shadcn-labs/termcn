import { Text } from "ink";

import { Dialog } from "@/registry/bases/ink/ui/dialog";

export default function DialogDemo() {
  return (
    <Dialog
      isOpen={true}
      title="Delete project"
      variant="danger"
      confirmLabel="Delete"
      cancelLabel="Keep"
    >
      <Text>
        Are you sure you want to delete this project? This action cannot be
        undone.
      </Text>
    </Dialog>
  );
}
