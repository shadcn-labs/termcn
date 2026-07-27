import { Toast } from "@/registry/bases/ink/ui/toast";

export default function ToastError() {
  return (
    <Toast
      variant="error"
      message="Deploy failed. Check logs."
      duration={8000}
    />
  );
}
