import { insert, t } from "intlayer";
import type { Dictionary } from "intlayer";

const examplePreviewContent = {
  content: {
    inspectUsageSnippet: t({
      en: "Inspect the usage snippet below for install details and example props.",
      es: "Revisa el fragmento de uso de abajo para ver los detalles de instalación y las props de ejemplo.",
      fr: "Consultez l'extrait d'utilisation ci-dessous pour les détails d'installation et les props d'exemple.",
      ja: "インストール手順とサンプルの props は下の使用スニペットで確認できます。",
      ko: "설치 방법과 예제 props는 아래 사용 스니펫에서 확인하세요.",
      pt: "Confira o trecho de uso abaixo para detalhes de instalação e props de exemplo.",
      "zh-CN": "查看下方的用法片段，了解安装细节和示例 props。",
    }),
    livePreviewFallback: t({
      en: "Live preview fallback.",
      es: "Vista previa en vivo no disponible.",
      fr: "Aperçu en direct indisponible.",
      ja: "ライブプレビューの代替表示です。",
      ko: "라이브 미리보기 대체 화면입니다.",
      pt: "Prévia ao vivo indisponível.",
      "zh-CN": "实时预览已回退。",
    }),
    livePreviewFallbackWithMessage: insert(
      t({
        en: "Live preview fallback: {{message}}",
        es: "Vista previa en vivo no disponible: {{message}}",
        fr: "Aperçu en direct indisponible : {{message}}",
        ja: "ライブプレビューの代替表示: {{message}}",
        ko: "라이브 미리보기 대체: {{message}}",
        pt: "Prévia ao vivo indisponível: {{message}}",
        "zh-CN": "实时预览已回退：{{message}}",
      })
    ),
    loadingPreview: t({
      en: "Loading preview...",
      es: "Cargando vista previa...",
      fr: "Chargement de l'aperçu...",
      ja: "プレビューを読み込み中...",
      ko: "미리보기를 불러오는 중...",
      pt: "Carregando prévia...",
      "zh-CN": "正在加载预览...",
    }),
    noLivePreviewRegistered: insert(
      t({
        en: "No {{base}} live preview is registered for this example yet.",
        es: "Todavía no hay una vista previa en vivo de {{base}} registrada para este ejemplo.",
        fr: "Aucun aperçu en direct {{base}} n'est encore enregistré pour cet exemple.",
        ja: "この例にはまだ {{base}} のライブプレビューが登録されていません。",
        ko: "이 예제에는 아직 {{base}} 라이브 미리보기가 등록되지 않았습니다.",
        pt: "Ainda não há uma prévia ao vivo de {{base}} registrada para este exemplo.",
        "zh-CN": "此示例尚未注册 {{base}} 实时预览。",
      })
    ),
  },
  key: "example-preview",
} satisfies Dictionary;

export default examplePreviewContent;
