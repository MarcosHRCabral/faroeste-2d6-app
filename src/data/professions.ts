import type { Profession } from "../types";

export const professions: Profession[] = [
  {
    id: "pistoleiro",
    name: "Pistoleiro",
    description: "Vive de mira firme, reputacao e uma saida sempre calculada.",
    skills: [
      { id: "armas-fogo", bonus: 2 },
      { id: "intimidacao", bonus: 1 },
      { id: "cavalgar", bonus: 1 }
    ],
    equipment: ["Coldre gasto", "Kit de limpeza de armas", "Baralho marcado por uso"],
    weapons: ["Revolver Colt", "Faca de bota"],
    money: 18,
    advantage: "Saque rapido",
    disadvantage: "Reputacao perigosa"
  },
  {
    id: "xerife",
    name: "Xerife",
    description: "Carrega autoridade, papelada e a responsabilidade de manter uma cidade inteira de pe.",
    skills: [
      { id: "armas-fogo", bonus: 1 },
      { id: "investigacao", bonus: 1 },
      { id: "intimidacao", bonus: 1 },
      { id: "persuasao", bonus: 1 }
    ],
    equipment: ["Distintivo", "Algemas", "Livro de ocorrencias"],
    weapons: ["Revolver de servico"],
    money: 24,
    advantage: "Autoridade local",
    disadvantage: "Dever publico"
  },
  {
    id: "cacador-recompensas",
    name: "Cacador de recompensas",
    description: "Segue rastros, cartazes e rumores ate alguem pagar pelo fim da perseguicao.",
    skills: [
      { id: "rastrear", bonus: 2 },
      { id: "armas-fogo", bonus: 1 },
      { id: "sobrevivencia", bonus: 1 }
    ],
    equipment: ["Cartazes de procurado", "Corda resistente", "Binoculo simples"],
    weapons: ["Rifle Winchester", "Revolver curto"],
    money: 20,
    advantage: "Paciente na caca",
    disadvantage: "Inimigos acumulados"
  },
  {
    id: "medico-fronteira",
    name: "Medico de fronteira",
    description: "Costura gente, improvisa remedios e negocia com a morte em quartos mal iluminados.",
    skills: [
      { id: "medicina", bonus: 2 },
      { id: "persuasao", bonus: 1 },
      { id: "investigacao", bonus: 1 }
    ],
    equipment: ["Bolsa medica", "Laudano diluido", "Caderno de pacientes"],
    weapons: ["Derringer escondida"],
    money: 28,
    advantage: "Mao firme",
    disadvantage: "Juramento incomodo"
  },
  {
    id: "jogador",
    name: "Jogador profissional",
    description: "Ganha dinheiro lendo pessoas, controlando expressoes e sabendo quando fugir.",
    skills: [
      { id: "jogo", bonus: 2 },
      { id: "persuasao", bonus: 1 },
      { id: "furtividade", bonus: 1 }
    ],
    equipment: ["Baralho fino", "Roupa elegante", "Moeda da sorte"],
    weapons: ["Pistola de bolso"],
    money: 35,
    advantage: "Cara de paisagem",
    disadvantage: "Dividas de mesa"
  },
  {
    id: "fazendeiro",
    name: "Fazendeiro",
    description: "Conhece terra, gado, clima ruim e vizinhos piores.",
    skills: [
      { id: "lidar-animais", bonus: 2 },
      { id: "oficio", bonus: 1 },
      { id: "sobrevivencia", bonus: 1 }
    ],
    equipment: ["Ferramentas de cerca", "Sementes", "Contrato de terra"],
    weapons: ["Espingarda de fazenda"],
    money: 16,
    advantage: "Pe no chao",
    disadvantage: "Terra ameacada"
  },
  {
    id: "rastreador",
    name: "Rastreador",
    description: "Enxerga historias em poeira, galhos quebrados e fogueiras apagadas.",
    skills: [
      { id: "rastrear", bonus: 2 },
      { id: "sobrevivencia", bonus: 1 },
      { id: "procurar", bonus: 1 }
    ],
    equipment: ["Manta de acampamento", "Pederneira", "Cantinas extras"],
    weapons: ["Rifle de caca"],
    money: 14,
    advantage: "Olhos de trilha",
    disadvantage: "Pouca paciencia com cidade"
  },
  {
    id: "ferreiro",
    name: "Ferreiro",
    description: "Transforma metal quente em ferramenta, ferradura, grade ou arma improvisada.",
    skills: [
      { id: "oficio", bonus: 2 },
      { id: "reparos", bonus: 1 },
      { id: "briga", bonus: 1 }
    ],
    equipment: ["Martelo de ferreiro", "Avental grosso", "Pregos e rebites"],
    weapons: ["Martelo pesado"],
    money: 22,
    advantage: "Oficina respeitada",
    disadvantage: "Chamado para todo conserto"
  },
  {
    id: "pregador",
    name: "Pregador",
    description: "Move multidoes com palavra, fe e um olhar atento para pecados humanos.",
    skills: [
      { id: "religiao", bonus: 2 },
      { id: "persuasao", bonus: 1 },
      { id: "vontade", bonus: 1 }
    ],
    equipment: ["Biblia marcada", "Caderno de sermoes", "Caixa de doacoes"],
    weapons: ["Cajado resistente"],
    money: 12,
    advantage: "Voz de assembleia",
    disadvantage: "Codigo moral rigido"
  },
  {
    id: "fora-da-lei",
    name: "Fora da lei",
    description: "Sabe onde a lei termina, onde a perseguicao comeca e quem compra silencio.",
    skills: [
      { id: "furtividade", bonus: 2 },
      { id: "armas-fogo", bonus: 1 },
      { id: "intimidacao", bonus: 1 }
    ],
    equipment: ["Mascara de pano", "Bolsa de saque vazia", "Mapa de fuga"],
    weapons: ["Revolver gasto", "Escopeta curta"],
    money: 26,
    advantage: "Plano de fuga",
    disadvantage: "Procurado"
  },
  {
    id: "garimpeiro",
    name: "Garimpeiro",
    description: "Segue veios, rumores de ouro e promessas que quase nunca pagam.",
    skills: [
      { id: "sobrevivencia", bonus: 1 },
      { id: "oficio", bonus: 1 },
      { id: "explosivos", bonus: 1 },
      { id: "vontade", bonus: 1 }
    ],
    equipment: ["Picareta", "Peneira", "Dinamite velha"],
    weapons: ["Revolver enferrujado"],
    money: 9,
    advantage: "Teimosia de mina",
    disadvantage: "Febre do ouro"
  },
  {
    id: "comerciante",
    name: "Comerciante",
    description: "Compra barato, vende caro e sabe que informacao tambem e mercadoria.",
    skills: [
      { id: "comercio", bonus: 2 },
      { id: "persuasao", bonus: 1 },
      { id: "procurar", bonus: 1 }
    ],
    equipment: ["Livro caixa", "Amostras de mercadoria", "Carta de credito"],
    weapons: ["Derringer de gaveta"],
    money: 45,
    advantage: "Rede de fornecedores",
    disadvantage: "Credores atentos"
  },
  {
    id: "domador",
    name: "Domador de cavalos",
    description: "Entende medo animal melhor que muita gente entende conversa.",
    skills: [
      { id: "lidar-animais", bonus: 2 },
      { id: "cavalgar", bonus: 1 },
      { id: "vontade", bonus: 1 }
    ],
    equipment: ["Laco", "Escova de montaria", "Luvas grossas"],
    weapons: ["Faca de campo"],
    money: 17,
    advantage: "Montaria fiel",
    disadvantage: "Arrisca-se por animais"
  },
  {
    id: "jornalista",
    name: "Jornalista",
    description: "Corre atras da verdade, ou da manchete que vai vender ate segunda-feira.",
    skills: [
      { id: "investigacao", bonus: 2 },
      { id: "persuasao", bonus: 1 },
      { id: "procurar", bonus: 1 }
    ],
    equipment: ["Bloco de notas", "Tinteiro portatil", "Credencial de imprensa"],
    weapons: ["Bengala pesada"],
    money: 19,
    advantage: "Nariz para noticia",
    disadvantage: "Curiosidade perigosa"
  },
  {
    id: "investigador-oculto",
    name: "Investigador do oculto",
    description:
      "Segue rastros que outros fingem nao ver: lendas, simbolos, mortes impossiveis e medo antigo.",
    skills: [
      { id: "ocultismo", bonus: 2 },
      { id: "investigacao", bonus: 1 },
      { id: "vontade", bonus: 1 }
    ],
    equipment: ["Diario cifrado", "Sal grosso", "Lanterna confiavel"],
    weapons: ["Revolver antigo"],
    money: 21,
    advantage: "Arquivo proibido",
    disadvantage: "Marcado pelo estranho",
    supernatural: true
  }
];
