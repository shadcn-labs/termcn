import { Toast } from "@/registry/bases/opentui/ui/toast";

export default function ToastError() {
  return (
    <Toast
      variant="error"
      message="Deploy failed. Check logs."
      duration={8000}
    />
  );
}
