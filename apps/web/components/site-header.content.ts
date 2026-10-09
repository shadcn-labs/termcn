import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const siteHeaderContent = {
  content: {
    navCharts: t({
      en: "Charts",
      es: "Gráficos",
      fr: "Graphiques",
      ja: "チャート",
      ko: "차트",
      pt: "Gráficos",
      "zh-CN": "图表",
    }),
    navComponents: t({
      en: "Components",
      es: "Componentes",
      fr: "Composants",
      ja: "コンポーネント",
      ko: "컴포넌트",
      pt: "Componentes",
      "zh-CN": "组件",
    }),
    navDocs: t({
      en: "Docs",
      es: "Documentación",
      fr: "Documentation",
      ja: "ドキュメント",
      ko: "문서",
      pt: "Documentação",
      "zh-CN": "文档",
    }),
    navSponsors: t({
      en: "Sponsors",
      es: "Patrocinadores",
      fr: "Sponsors",
      ja: "スポンサー",
      ko: "스폰서",
      pt: "Patrocinadores",
      "zh-CN": "赞助者",
    }),
    navTemplates: t({
      en: "Templates",
      es: "Plantillas",
      fr: "Modèles",
      ja: "テンプレート",
      ko: "템플릿",
      pt: "Modelos",
      "zh-CN": "模板",
    }),
  },
  key: "site-header",
} satisfies Dictionary;

export default siteHeaderContent;
