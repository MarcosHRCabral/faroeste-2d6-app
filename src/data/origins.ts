import type { Origin } from "../types";

export const origins: Origin[] = [
  {
    id: "fronteira-branco",
    name: "Americano branco da fronteira",
    description:
      "Cresceu em fazendas, vilas de poeira ou familias que seguiram a expansao para oeste.",
    hook: "Conhece as regras nao escritas das pequenas cidades e sabe quem manda de verdade.",
    suggestedSkillId: "sobrevivencia",
    suggestedSkillBonus: 1,
    startingItem: "Mapa gasto da regiao",
    contact: "Um capataz ou agente de diligencia",
    narrativeAdvantage: "Conhece trilhas locais"
  },
  {
    id: "nativo-americano",
    name: "Nativo americano",
    description:
      "Vem de uma nacao indigena especifica escolhida pelo jogador e pelo mestre, com historia propria.",
    hook: "Tem uma leitura fina do territorio e das tensoes politicas da fronteira.",
    suggestedSkillId: "rastrear",
    suggestedSkillBonus: 1,
    startingItem: "Talento de artesanato ou objeto de familia",
    contact: "Um parente, guia ou mensageiro de confianca",
    narrativeAdvantage: "Leitura respeitosa do territorio"
  },
  {
    id: "imigrante-chines",
    name: "Imigrante chines",
    description:
      "Chegou por trabalho, comercio, ferrovia ou redes familiares em meio a muito preconceito local.",
    hook: "Sabe circular entre comunidades de imigrantes, cozinhas, lavadeiras e obras da ferrovia.",
    suggestedSkillId: "comercio",
    suggestedSkillBonus: 1,
    startingItem: "Caderno com contatos e dividas pequenas",
    contact: "Um comerciante ou trabalhador da ferrovia",
    narrativeAdvantage: "Rede discreta de apoio"
  },
  {
    id: "mexicano-vaqueiro",
    name: "Mexicano / vaqueiro",
    description:
      "Formado em ranchos, cidades de fronteira ou familias que vivem entre dois lados da linha.",
    hook: "Transita por culturas, idiomas e rotas de gado com naturalidade.",
    suggestedSkillId: "cavalgar",
    suggestedSkillBonus: 1,
    startingItem: "Sela bem cuidada",
    contact: "Um rancheiro, tropeiro ou cantineira",
    narrativeAdvantage: "Conhece rotas de gado"
  },
  {
    id: "liberto",
    name: "Ex-escravizado ou liberto",
    description:
      "Construiu a propria vida depois da escravidao ou nasceu em uma familia livre lutando por espaco.",
    hook: "Tem experiencia real com sistemas injustos e sabe reconhecer perigo social cedo.",
    suggestedSkillId: "vontade",
    suggestedSkillBonus: 1,
    startingItem: "Documento de liberdade, contrato ou carta importante",
    contact: "Um familiar, pastor, professor ou veterano",
    narrativeAdvantage: "Resistencia diante de pressao"
  },
  {
    id: "europeu-chegado",
    name: "Europeu recem-chegado",
    description:
      "Veio atras de terra, trabalho, pesquisa, fuga politica ou uma promessa de riqueza.",
    hook: "Traz conhecimentos de fora e ainda esta aprendendo como a fronteira cobra seus erros.",
    suggestedSkillId: "oficio",
    suggestedSkillBonus: 1,
    startingItem: "Ferramenta de oficio de boa qualidade",
    contact: "Um conterraneo, padre, editor ou agente de viagens",
    narrativeAdvantage: "Olhar de fora"
  },
  {
    id: "mestico-fronteira",
    name: "Mestico da fronteira",
    description:
      "Nasceu entre mundos, linguas e costumes, acostumado a negociar identidade e sobrevivencia.",
    hook: "Entende que a fronteira muda conforme a pessoa que esta olhando.",
    suggestedSkillId: "persuasao",
    suggestedSkillBonus: 1,
    startingItem: "Amuleto, carta ou lembranca de familia",
    contact: "Um parente em outra cidade",
    narrativeAdvantage: "Pontes entre comunidades"
  },
  {
    id: "fora-da-lei",
    name: "Fora da lei sem origem clara",
    description:
      "Deixou passado, sobrenome e registros para tras. Talvez por culpa, talvez por sobrevivencia.",
    hook: "Sabe sumir, mentir pouco e medir uma sala antes de sentar.",
    suggestedSkillId: "furtividade",
    suggestedSkillBonus: 1,
    startingItem: "Nome falso e um esconderijo simples",
    contact: "Um atravessador que cobra caro",
    narrativeAdvantage: "Passado dificil de rastrear"
  }
];
