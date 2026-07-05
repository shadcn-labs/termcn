import { Dialog } from "@/registry/bases/opentui/ui/dialog";

export default function DialogDemo() {
  return (
    <Dialog
      isOpen={true}
      title="Delete project"
      variant="danger"
      confirmLabel="Delete"
      cancelLabel="Keep"
    >
      <text>
        Are you sure you want to delete this project? This action cannot be
        undone.
      </text>
    </Dialog>
  );
}
