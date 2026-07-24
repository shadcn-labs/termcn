import { Banner } from "@/registry/bases/ink/ui/banner";

export default function BannerError() {
  return (
    <Banner variant="error" icon="💥" title="Crash">
      Worker process exited with code 1.
    </Banner>
  );
}
