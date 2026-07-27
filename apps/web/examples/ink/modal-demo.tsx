import { Text } from "ink";

import { Modal } from "@/registry/bases/ink/ui/modal";

export default function ModalDemo() {
  return (
    <Modal open={true} title="Welcome" width={50}>
      <Text>This is a modal dialog. Press Esc to close it.</Text>
    </Modal>
  );
}
