import { insert, t } from "intlayer";
import type { Dictionary } from "intlayer";

const docsCopyPageContent = {
  content: {
    aiPrompt: insert(
      t({
        en: "I'm looking at this termcn documentation: {{url}}.\nHelp me understand how to use it. Be ready to explain concepts, give examples, or help debug based on it.\n",
        es: "Estoy viendo esta documentación de termcn: {{url}}.\nAyúdame a entender cómo usarla. Prepárate para explicar conceptos, dar ejemplos o ayudar a depurar basándote en ella.\n",
        fr: "Je consulte cette documentation termcn : {{url}}.\nAide-moi à comprendre comment l'utiliser. Sois prêt à expliquer des concepts, donner des exemples ou aider à déboguer en te basant dessus.\n",
        ja: "termcn のこのドキュメントを見ています: {{url}}。\n使い方を理解できるように手伝ってください。概念の説明、例の提示、これに基づくデバッグの支援をお願いします。\n",
        ko: "termcn 문서를 보고 있습니다: {{url}}.\n사용 방법을 이해할 수 있도록 도와주세요. 개념 설명, 예제 제공, 이를 바탕으로 한 디버깅을 도와주세요.\n",
        pt: "Estou vendo esta documentação do termcn: {{url}}.\nAjude-me a entender como usá-la. Esteja pronto para explicar conceitos, dar exemplos ou ajudar a depurar com base nela.\n",
        "zh-CN":
          "我正在查看这份 termcn 文档：{{url}}。\n请帮我理解如何使用它。请准备好解释概念、提供示例，或基于它帮助调试。\n",
      })
    ),
    copyPage: t({
      en: "Copy Page",
      es: "Copiar página",
      fr: "Copier la page",
      ja: "ページをコピー",
      ko: "페이지 복사",
      pt: "Copiar página",
      "zh-CN": "复制页面",
    }),
    openInChatGpt: t({
      en: "Open in ChatGPT",
      es: "Abrir en ChatGPT",
      fr: "Ouvrir dans ChatGPT",
      ja: "ChatGPT で開く",
      ko: "ChatGPT에서 열기",
      pt: "Abrir no ChatGPT",
      "zh-CN": "在 ChatGPT 中打开",
    }),
    openInClaude: t({
      en: "Open in Claude",
      es: "Abrir en Claude",
      fr: "Ouvrir dans Claude",
      ja: "Claude で開く",
      ko: "Claude에서 열기",
      pt: "Abrir no Claude",
      "zh-CN": "在 Claude 中打开",
    }),
    openInCursor: t({
      en: "Open in Cursor",
      es: "Abrir en Cursor",
      fr: "Ouvrir dans Cursor",
      ja: "Cursor で開く",
      ko: "Cursor에서 열기",
      pt: "Abrir no Cursor",
      "zh-CN": "在 Cursor 中打开",
    }),
    openInGemini: t({
      en: "Open in Gemini",
      es: "Abrir en Gemini",
      fr: "Ouvrir dans Gemini",
      ja: "Gemini で開く",
      ko: "Gemini에서 열기",
      pt: "Abrir no Gemini",
      "zh-CN": "在 Gemini 中打开",
    }),
    openInGrok: t({
      en: "Open in Grok",
      es: "Abrir en Grok",
      fr: "Ouvrir dans Grok",
      ja: "Grok で開く",
      ko: "Grok에서 열기",
      pt: "Abrir no Grok",
      "zh-CN": "在 Grok 中打开",
    }),
    openInPerplexity: t({
      en: "Open in Perplexity",
      es: "Abrir en Perplexity",
      fr: "Ouvrir dans Perplexity",
      ja: "Perplexity で開く",
      ko: "Perplexity에서 열기",
      pt: "Abrir no Perplexity",
      "zh-CN": "在 Perplexity 中打开",
    }),
    openInScira: t({
      en: "Open in Scira AI",
      es: "Abrir en Scira AI",
      fr: "Ouvrir dans Scira AI",
      ja: "Scira AI で開く",
      ko: "Scira AI에서 열기",
      pt: "Abrir no Scira AI",
      "zh-CN": "在 Scira AI 中打开",
    }),
    openInV0: t({
      en: "Open in v0",
      es: "Abrir en v0",
      fr: "Ouvrir dans v0",
      ja: "v0 で開く",
      ko: "v0에서 열기",
      pt: "Abrir no v0",
      "zh-CN": "在 v0 中打开",
    }),
    viewAsMarkdown: t({
      en: "View as Markdown",
      es: "Ver como Markdown",
      fr: "Afficher en Markdown",
      ja: "Markdown で表示",
      ko: "Markdown으로 보기",
      pt: "Ver como Markdown",
      "zh-CN": "以 Markdown 查看",
    }),
  },
  key: "docs-copy-page",
} satisfies Dictionary;

export default docsCopyPageContent;
