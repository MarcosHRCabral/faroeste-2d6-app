import type { SkillTemplate } from "../types";

export const skillTemplates: SkillTemplate[] = [
  {
    id: "armas-fogo",
    name: "Armas de fogo",
    attribute: "destreza",
    description: "Revolveres, pistolas, rifles e espingardas."
  },
  {
    id: "armas-brancas",
    name: "Armas brancas",
    attribute: "forca",
    description: "Facas, sabres, machados e improvisos cortantes."
  },
  {
    id: "briga",
    name: "Briga",
    attribute: "forca",
    description: "Soco, agarrar, empurrar e sobreviver a uma confusao de saloon."
  },
  {
    id: "cavalgar",
    name: "Cavalgar",
    attribute: "destreza",
    description: "Montaria, corrida, salto e controle do animal em perigo."
  },
  {
    id: "sobrevivencia",
    name: "Sobrevivencia",
    attribute: "constituicao",
    description: "Agua, abrigo, comida e resistencia em territorio duro."
  },
  {
    id: "rastrear",
    name: "Rastrear",
    attribute: "inteligencia",
    description: "Ler pegadas, trilhas, sinais de acampamento e passagem recente."
  },
  {
    id: "intimidacao",
    name: "Intimidacao",
    attribute: "forca",
    description: "Pressao, presenca e ameacas criveis."
  },
  {
    id: "persuasao",
    name: "Persuasao",
    attribute: "sorte",
    description: "Conversa, negociacao rapida e boa leitura social."
  },
  {
    id: "medicina",
    name: "Medicina",
    attribute: "inteligencia",
    description: "Tratamento de ferimentos, febres e emergencias de fronteira."
  },
  {
    id: "furtividade",
    name: "Furtividade",
    attribute: "destreza",
    description: "Mover-se sem ser notado, esconder-se e escapar de vigilancia."
  },
  {
    id: "jogo",
    name: "Jogo",
    attribute: "sorte",
    description: "Cartas, blefe, probabilidade e leitura de mesa."
  },
  {
    id: "investigacao",
    name: "Investigacao",
    attribute: "inteligencia",
    description: "Juntar pistas, perceber contradicoes e reconstruir eventos."
  },
  {
    id: "reparos",
    name: "Reparos",
    attribute: "inteligencia",
    description: "Consertos de armas, carrocas, trilhos, ferramentas e fechaduras simples."
  },
  {
    id: "comercio",
    name: "Comercio",
    attribute: "inteligencia",
    description: "Preco justo, barganha, estoque e rotas de suprimento."
  },
  {
    id: "religiao",
    name: "Religiao",
    attribute: "inteligencia",
    description: "Doutrina, ritos, comunidades e autoridade religiosa."
  },
  {
    id: "lidar-animais",
    name: "Lidar com animais",
    attribute: "sorte",
    description: "Acalmar, treinar, conduzir e reconhecer sinais de animais."
  },
  {
    id: "explosivos",
    name: "Explosivos",
    attribute: "inteligencia",
    description: "Dinamite, pavios, demolicao e descarte cuidadoso."
  },
  {
    id: "procurar",
    name: "Procurar",
    attribute: "inteligencia",
    description: "Varredura de ambiente, objetos escondidos e detalhes fora do lugar."
  },
  {
    id: "vontade",
    name: "Vontade",
    attribute: "sorte",
    description: "Manter a cabeca fria sob medo, dor, tentacao ou pressao."
  },
  {
    id: "oficio",
    name: "Oficio",
    attribute: "inteligencia",
    description: "Trabalho especializado de oficina, fazenda, mina ou ferrovia."
  },
  {
    id: "ocultismo",
    name: "Ocultismo",
    attribute: "inteligencia",
    description: "Folclore sombrio, simbolos, lendas e ritos estranhos.",
    supernatural: true
  }
];
