import { QRCode } from "@/registry/bases/opentui/ui/qr-code";

export default function QRCodeDemo() {
  return <QRCode value="https://termcn.dev" size="md" label="Scan to visit" />;
}
