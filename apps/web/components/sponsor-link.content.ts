import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const sponsorLinkContent = {
  content: {
    sponsor: t({
      en: "Sponsor",
      es: "Patrocinar",
      fr: "Sponsoriser",
      ja: "スポンサーになる",
      ko: "후원하기",
      pt: "Patrocinar",
      "zh-CN": "赞助",
    }),
  },
  key: "sponsor-link",
} satisfies Dictionary;

export default sponsorLinkContent;
