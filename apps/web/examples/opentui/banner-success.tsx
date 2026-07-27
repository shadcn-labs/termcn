import { Banner } from "@/registry/bases/opentui/ui/banner";

export default function BannerSuccess() {
  return (
    <Banner variant="success" title="Deployed">
      All services are live.
    </Banner>
  );
}
