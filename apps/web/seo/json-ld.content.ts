import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const jsonLdContent = {
  content: {
    faqOpenSourceAnswer: t({
      en: "Yes. The source is on GitHub and released under the MIT License.",
      es: "Sí. El código fuente está en GitHub y se publica bajo la Licencia MIT.",
      fr: "Oui. Le code source est sur GitHub et publié sous licence MIT.",
      ja: "はい。ソースコードは GitHub で公開されており、MIT ライセンスの下で提供されています。",
      ko: "네. 소스 코드는 GitHub에 공개되어 있으며 MIT 라이선스로 배포됩니다.",
      pt: "Sim. O código-fonte está no GitHub e é publicado sob a Licença MIT.",
      "zh-CN": "是的。源代码托管在 GitHub 上，并以 MIT 许可证发布。",
    }),
    faqOpenSourceQuestion: t({
      en: "Is termcn open source?",
      es: "¿Es termcn de código abierto?",
      fr: "termcn est-il open source ?",
      ja: "termcn はオープンソースですか？",
      ko: "termcn은 오픈 소스인가요?",
      pt: "O termcn é open source?",
      "zh-CN": "termcn 是开源的吗？",
    }),
    faqPublishAnswer: t({
      en: "Add or edit components under registry/bases/ink/ or registry/bases/opentui/, register them in registry.json, run pnpm registry:build (which refreshes public/r/), then deploy. Consumers install with npx shadcn@latest add against your published registry URL.",
      es: "Añade o edita componentes en registry/bases/ink/ o registry/bases/opentui/, regístralos en registry.json, ejecuta pnpm registry:build (que actualiza public/r/) y despliega. Los consumidores instalan con npx shadcn@latest add apuntando a la URL de tu registro publicado.",
      fr: "Ajoutez ou modifiez des composants dans registry/bases/ink/ ou registry/bases/opentui/, enregistrez-les dans registry.json, exécutez pnpm registry:build (qui actualise public/r/), puis déployez. Les utilisateurs installent avec npx shadcn@latest add en pointant vers l'URL de votre registre publié.",
      ja: "registry/bases/ink/ または registry/bases/opentui/ にコンポーネントを追加・編集し、registry.json に登録して pnpm registry:build（public/r/ を更新します）を実行し、デプロイします。利用者は公開したレジストリ URL を指定して npx shadcn@latest add でインストールできます。",
      ko: "registry/bases/ink/ 또는 registry/bases/opentui/ 아래에 컴포넌트를 추가하거나 수정하고, registry.json에 등록한 뒤 pnpm registry:build를 실행해(public/r/가 갱신됩니다) 배포하세요. 사용자는 게시된 레지스트리 URL을 대상으로 npx shadcn@latest add 명령으로 설치합니다.",
      pt: "Adicione ou edite componentes em registry/bases/ink/ ou registry/bases/opentui/, registre-os no registry.json, execute pnpm registry:build (que atualiza public/r/) e faça o deploy. Os consumidores instalam com npx shadcn@latest add apontando para a URL do seu registro publicado.",
      "zh-CN":
        "在 registry/bases/ink/ 或 registry/bases/opentui/ 下添加或修改组件，在 registry.json 中注册，运行 pnpm registry:build（会刷新 public/r/），然后部署。使用者通过 npx shadcn@latest add 指向你发布的注册表 URL 进行安装。",
    }),
    faqPublishQuestion: t({
      en: "How do I publish components with termcn?",
      es: "¿Cómo publico componentes con termcn?",
      fr: "Comment publier des composants avec termcn ?",
      ja: "termcn でコンポーネントを公開するには？",
      ko: "termcn으로 컴포넌트를 어떻게 게시하나요?",
      pt: "Como publico componentes com o termcn?",
      "zh-CN": "如何使用 termcn 发布组件？",
    }),
    faqWhatIsAnswer: t({
      en: "A collection of beautifully designed, accessible, and customizable terminal UI components. Built on Ink and OpenTUI. Works with shadcn/ui.",
      es: "Una colección de componentes de interfaz de terminal bellamente diseñados, accesibles y personalizables. Construido sobre Ink y OpenTUI. Funciona con shadcn/ui.",
      fr: "Une collection de composants d'interface terminal magnifiquement conçus, accessibles et personnalisables. Construit sur Ink et OpenTUI. Compatible avec shadcn/ui.",
      ja: "美しくデザインされ、アクセシブルでカスタマイズ可能なターミナル UI コンポーネント集。Ink と OpenTUI を基盤に構築し、shadcn/ui と組み合わせて使えます。",
      ko: "아름답게 디자인되고 접근성이 뛰어나며 커스터마이징 가능한 터미널 UI 컴포넌트 모음입니다. Ink와 OpenTUI를 기반으로 제작되었으며 shadcn/ui와 함께 사용할 수 있습니다.",
      pt: "Uma coleção de componentes de interface de terminal lindamente projetados, acessíveis e personalizáveis. Criado com base em Ink e OpenTUI. Funciona com shadcn/ui.",
      "zh-CN":
        "一套设计精美、无障碍且可自定义的终端 UI 组件集合。基于 Ink 和 OpenTUI 构建，可与 shadcn/ui 配合使用。",
    }),
    faqWhatIsQuestion: t({
      en: "What is termcn?",
      es: "¿Qué es termcn?",
      fr: "Qu'est-ce que termcn ?",
      ja: "termcn とは？",
      ko: "termcn이란 무엇인가요?",
      pt: "O que é o termcn?",
      "zh-CN": "termcn 是什么？",
    }),
    inLanguage: t({
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      ja: "ja-JP",
      ko: "ko-KR",
      pt: "pt-BR",
      "zh-CN": "zh-CN",
    }),
  },
  key: "json-ld",
} satisfies Dictionary;

export default jsonLdContent;
