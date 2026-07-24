import { Modal } from "@/registry/bases/opentui/ui/modal";

export default function ModalDemo() {
  return (
    <Modal open={true} title="Welcome" width={50}>
      <text>This is a modal dialog. Press Esc to close it.</text>
    </Modal>
  );
}
