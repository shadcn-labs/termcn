import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const launchWeekDetailPageContent = {
  content: {
    breadcrumbHome: t({
      en: "Home",
      es: "Inicio",
      fr: "Accueil",
      ja: "ホーム",
      ko: "홈",
      pt: "Início",
      "zh-CN": "首页",
    }),
    breadcrumbLaunchWeeks: t({
      en: "Launch Weeks",
      es: "Semanas de lanzamiento",
      fr: "Semaines de lancement",
      ja: "ローンチウィーク",
      ko: "런치 위크",
      pt: "Semanas de lançamento",
      "zh-CN": "发布周",
    }),
  },
  key: "launch-week-detail-page",
} satisfies Dictionary;

export default launchWeekDetailPageContent;
