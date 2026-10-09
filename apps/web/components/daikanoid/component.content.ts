import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const daikanoidComponentContent = {
  content: {
    gameAriaLabel: t({
      en: "Page not found. Interactive Breakout game built from the Shadcn Labs logo. Click or press Space to launch, then use the pointer or arrow keys to move.",
      es: "Página no encontrada. Juego Breakout interactivo creado a partir del logo de Shadcn Labs. Haz clic o pulsa Espacio para iniciar y luego usa el puntero o las teclas de flecha para moverte.",
      fr: "Page introuvable. Jeu Breakout interactif créé à partir du logo Shadcn Labs. Cliquez ou appuyez sur Espace pour lancer, puis utilisez le pointeur ou les touches fléchées pour vous déplacer.",
      ja: "ページが見つかりません。Shadcn Labs のロゴから作られたインタラクティブな Breakout ゲームです。クリックまたはスペースキーで開始し、ポインターか矢印キーで操作します。",
      ko: "페이지를 찾을 수 없습니다. Shadcn Labs 로고로 만든 인터랙티브 Breakout 게임입니다. 클릭하거나 스페이스 키를 눌러 시작한 뒤 포인터 또는 화살표 키로 이동하세요.",
      pt: "Página não encontrada. Jogo Breakout interativo criado a partir do logo da Shadcn Labs. Clique ou pressione Espaço para iniciar e use o ponteiro ou as teclas de seta para se mover.",
      "zh-CN":
        "页面未找到。由 Shadcn Labs 标志构建的交互式 Breakout 游戏。点击或按空格键开始，然后使用指针或方向键移动。",
    }),
  },
  key: "daikanoid-component",
} satisfies Dictionary;

export default daikanoidComponentContent;
