import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const announcementContent = {
  content: {
    launchWeekIsHere: t({
      en: "Launch week is here",
      es: "La semana de lanzamiento ya está aquí",
      fr: "La semaine de lancement est arrivée",
      ja: "ローンチウィーク開催中",
      ko: "런치 위크가 시작되었습니다",
      pt: "A semana de lançamento chegou",
      "zh-CN": "发布周来啦",
    }),
  },
  key: "announcement",
} satisfies Dictionary;

export default announcementContent;
