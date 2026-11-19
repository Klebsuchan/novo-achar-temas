import type { Post } from '../utils/blogLogic';

export interface ArticleFaqItem {
  question: string;
  answer: string;
}

export interface ArticleSeoProfile {
  slug: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  keywords: string[];
  keyTakeaways: string[];
  faqs: ArticleFaqItem[];
}

export const ARTICLE_SEO_MAP: Record<number, ArticleSeoProfile> = {
  685: {
    slug: 'constantino-ascensao-cristianismo-imperio-romano',
    seoTitle: 'Constantino e a Ascensão do Cristianismo em Roma: Guia Completo',
    metaDescription:
      'Entenda como Constantino transformou o Cristianismo de fé perseguida em força política do Império Romano, do Édito de Milão ao Concílio de Niceia.',
    focusKeyword: 'Constantino e o Cristianismo no Império Romano',
    keywords: [
      'Constantino I',
      'Édito de Milão 313',
      'Concílio de Niceia',
      'Cristianismo no Império Romano',
      'História Antiga de Roma',
      'Ponte Mílvia',
    ],
    keyTakeaways: [
      'A crise do século III abriu espaço para reformas políticas e religiosas profundas em Roma.',
      'O Édito de Milão (313 d.C.) garantiu liberdade de culto e restituiu bens às comunidades cristãs.',
      'O Concílio de Niceia (325 d.C.) consolidou a doutrina oficial e a aliança entre Igreja e Estado.',
    ],
    faqs: [
      {
        question: 'O que foi o Édito de Milão proclamado por Constantino?',
        answer:
          'Promulgado em 313 d.C. por Constantino e Licínio, o Édito de Milão encerrou as perseguições oficiais e estabeleceu a liberdade religiosa em todo o Império Romano.',
      },
      {
        question: 'Constantino tornou o Cristianismo a religião oficial de Roma?',
        answer:
          'Constantino legalizou e favoreceu o Cristianismo, mas a oficialização exclusiva como religião do Estado só ocorreu décadas depois, com o Édito de Tessalônica de Teodósio I, em 380 d.C.',
      },
      {
        question: 'Qual foi a importância do Concílio de Niceia em 325 d.C.?',
        answer:
          'Convocado por Constantino, o Concílio de Niceia reuniu bispos de todo o império para definir o Credo Niceno e unificar o calendário e a doutrina cristã.',
      },
    ],
  },
  678: {
    slug: 'ressurreicao-de-cristo-testemunhas-oculares-fontes',
    seoTitle: 'Ressurreição de Cristo: Testemunhas Oculares e Relatos Históricos',
    metaDescription:
      'Analise os registros antigos, relatos das testemunhas oculares e fontes romanas não cristãs sobre a ressurreição de Cristo e a origem do cristianismo.',
    focusKeyword: 'testemunhas oculares da ressurreição de Cristo',
    keywords: [
      'Ressurreição de Cristo',
      'Testemunhas oculares históricas',
      'Tácito e Plínio o Jovem',
      'Fontes históricas sobre Jesus',
      'Cristianismo primitivo',
      'História antiga',
    ],
    keyTakeaways: [
      'Os primeiros credos cristãos citam testemunhos nominais datados poucos anos após a crucificação.',
      'Historiadores romanos como Tácito e Flávio Josefo confirmam o contexto histórico do movimento.',
      'A mudança radical dos discípulos é um dos pontos centrais estudados por historiadores da Antiguidade.',
    ],
    faqs: [
      {
        question: 'Existem fontes não cristãs da Antiguidade que citam Jesus e os primeiros cristãos?',
        answer:
          'Sim. Autores romanos e judeus do primeiro e segundo séculos, como Tácito, Plínio, o Jovem, Suetônio e Flávio Josefo, registram a existência do movimento cristão e sua rápida expansão.',
      },
      {
        question: 'Por que o testemunho das mulheres nos evangelhos chama atenção histórica?',
        answer:
          'No mundo antigo, o depoimento feminino tinha peso jurídico limitado; historiadores apontam que citar mulheres como primeiras testemunhas contrariava convenções da época.',
      },
      {
        question: 'Qual o papel das cartas paulinas no estudo histórico da ressurreição?',
        answer:
          'As epístolas autênticas de Paulo são os documentos mais antigos preservados e trazem fórmulas orais que circulavam já nos primeiros anos após os eventos relatados.',
      },
    ],
  },
  669: {
    slug: 'carnaval-origem-historica-estrategia-religiosa-tradicao',
    seoTitle: 'Origem do Carnaval: Raízes Pagãs, Igreja e Tradição Cultural',
    metaDescription:
      'Descubra a verdadeira origem histórica do Carnaval: das Saturnálias romanas à adaptação no calendário cristão da Idade Média e à tradição brasileira.',
    focusKeyword: 'origem histórica do Carnaval',
    keywords: [
      'Origem do Carnaval',
      'Carnaval e Igreja Medieval',
      'Saturnália Romana',
      'História da Quaresma',
      'Festa popular na Idade Média',
      'Tradições culturais',
    ],
    keyTakeaways: [
      'O Carnaval não foi criado do zero pela Igreja, mas adaptado de festivais agrários antigos.',
      'A criação da Quaresma concentrou os excessos festivos nos dias anteriores ao jejum.',
      'O uso de máscaras permitia a inversão temporária das rígidas hierarquias medievais.',
    ],
    faqs: [
      {
        question: 'A Igreja Católica criou o Carnaval?',
        answer:
          'Não. As celebrações de colheita e renovação já existiam em Roma e na Grécia Antiga; a Igreja incorporou o período ao calendário litúrgico como preparação para a Quaresma.',
      },
      {
        question: 'O que significa a palavra Carnaval?',
        answer:
          'A etimologia mais aceita vem do latim "carnem levare" ou "carne vale", que remete à despedida da carne antes dos quarenta dias de abstinência da Quaresma.',
      },
      {
        question: 'Por que o Carnaval tem datas diferentes a cada ano?',
        answer:
          'Porque sua data é calculada 47 dias antes do Domingo de Páscoa, que acompanha o ciclo lunar da primavera no hemisfério norte.',
      },
    ],
  },
  666: {
    slug: 'figuras-de-chladni-som-geometria-cimatica',
    seoTitle: 'Figuras de Chladni: Como o Som Cria Geometria e Padrões Visuais',
    metaDescription:
      'Entenda a física por trás das Figuras de Chladni e da cimática: como ondas sonoras estacionárias formam desenhos geométricos perfeitos na areia.',
    focusKeyword: 'Figuras de Chladni e cimática',
    keywords: [
      'Figuras de Chladni',
      'Ernst Chladni',
      'Cimática e som',
      'Ondas estacionárias',
      'Física acústica',
      'Geometria do som',
    ],
    keyTakeaways: [
      'Ernst Chladni demonstrou em 1787 como frequências sonoras organizam partículas em padrões simétricos.',
      'A areia se acumula nas linhas nodais, áreas da placa metálica onde a vibração é nula.',
      'O fenômeno originou a acústica moderna e auxilia hoje na fabricação de instrumentos musicais.',
    ],
    faqs: [
      {
        question: 'O que são as Figuras de Chladni?',
        answer:
          'São desenhos geométricos formados por areia ou sal sobre uma placa vibrante quando submetida a diferentes frequências sonoras puras.',
      },
      {
        question: 'Por que a areia se move apenas para certos pontos da placa?',
        answer:
          'As ondas estacionárias criam zonas de vibração intensa e linhas de repouso chamadas nós; a areia é empurrada das áreas vibrantes até repousar nas linhas nodais.',
      },
      {
        question: 'Onde a física das placas de Chladni é aplicada hoje?',
        answer:
          'Luthiers usam o método para calibrar o tampo de violinos e violões, e engenheiros aplicam princípios semelhantes no controle de vibrações industriais.',
      },
    ],
  },
  659: {
    slug: 'pelos-poderes-de-grayskull-historia-he-man-anos-80',
    seoTitle: 'Pelos Poderes de Grayskull: A História de He-Man e Cultura Pop',
    metaDescription:
      'Relembre como He-Man e os Mestres do Universo revolucionaram a animação, o mercado de brinquedos e o imaginário da cultura pop dos anos 80.',
    focusKeyword: 'história de He-Man e Mestres do Universo',
    keywords: [
      'Pelos Poderes de Grayskull',
      'He-Man anos 80',
      'Mestres do Universo',
      'Filmation animação',
      'Cultura pop clássica',
      'Esqueleto Eternia',
    ],
    keyTakeaways: [
      'He-Man nasceu de uma linha de bonecos da Mattel que inspirou a série da Filmation em 1983.',
      'Eternia misturou fantasia medieval, magia e tecnologia espacial de forma inédita na TV.',
      'O impacto cultural consolidou modelos de franquia multimídia seguidos até hoje.',
    ],
    faqs: [
      {
        question: 'Qual surgiu primeiro: o desenho do He-Man ou os brinquedos?',
        answer:
          'Os bonecos da Mattel foram desenvolvidos primeiro, em 1981–1982, e a série animada da Filmation estreou em 1983 para construir a mitologia de Eternia.',
      },
      {
        question: 'Por que todos os episódios tinham uma lição moral no final?',
        answer:
          'Os produtores adotaram mensagens educativas curtas no encerramento para atender às diretrizes televisivas infantis da época e conquistar a confiança das famílias.',
      },
      {
        question: 'Qual o significado do Castelo de Grayskull na série?',
        answer:
          'O castelo guarda os segredos cósmicos de Eternia e é a fonte de poder que transforma o Príncipe Adam em He-Man.',
      },
    ],
  },
  655: {
    slug: 'historia-do-grunge-pearl-jam-seattle-anos-90',
    seoTitle: 'A História do Grunge e do Pearl Jam: O Som que Mudou os Anos 90',
    metaDescription:
      'Conheça as origens do movimento grunge em Seattle, a ascensão do álbum Ten do Pearl Jam e por que essa cena redefiniu o rock mundial nos anos 90.',
    focusKeyword: 'história do grunge e Pearl Jam',
    keywords: [
      'História do Grunge',
      'Pearl Jam álbum Ten',
      'Cena de Seattle anos 90',
      'Eddie Vedder',
      'Rock alternativo',
      'Geração X música',
    ],
    keyTakeaways: [
      'O isolamento geográfico e o clima chuvoso de Seattle moldaram uma cena musical crua e autêntica.',
      'O álbum Ten (1991) transformou o Pearl Jam em voz da Geração X sem apelar ao glamour pop.',
      'Letras sobre saúde mental, solidão e crítica social substituíram o hedonismo do rock dos anos 80.',
    ],
    faqs: [
      {
        question: 'Por que o movimento grunge começou justamente em Seattle?',
        answer:
          'Distante dos grandes polos comerciais de Los Angeles e Nova York, Seattle desenvolveu um circuito independente próprio unido pela gravadora Sub Pop e influências punk e metal.',
      },
      {
        question: 'Qual foi o impacto do álbum Ten do Pearl Jam?',
        answer:
          'Lançado em 1991, Ten apresentou faixas como Alive, Even Flow e Jeremy, vendendo dezenas de milhões de cópias e consolidando o rock alternativo nas rádios globais.',
      },
      {
        question: 'O que diferenciava o grunge do hard rock dos anos 1980?',
        answer:
          'O grunge rejeitava visuais glamourosos e virtuosismo excessivo, priorizando camisas de flanela, guitarras distorcidas e letras confessionais.',
      },
    ],
  },
  650: {
    slug: 'espiral-de-ervas-como-fazer-horta-permacultura',
    seoTitle: 'Espiral de Ervas: Como Fazer Passo a Passo na Permacultura',
    metaDescription:
      'Aprenda como construir uma espiral de ervas funcional em casa usando técnicas de permacultura para cultivar temperos com menos água e espaço.',
    focusKeyword: 'como fazer espiral de ervas',
    keywords: [
      'Espiral de ervas',
      'Permacultura urbana',
      'Horta em casa passo a passo',
      'Cultivo de temperos',
      'Microclimas no jardim',
      'Jardinagem sustentável',
    ],
    keyTakeaways: [
      'A espiral cria diferentes microclimas de sol, vento e umidade em apenas 1,5 m² de área.',
      'Ervas mediterrâneas como alecrim e tomilho ficam no topo seco; hortelã e cebolinha vão na base úmida.',
      'Pedras, tijolos reaproveitados e composto orgânico bastam para montar a estrutura.',
    ],
    faqs: [
      {
        question: 'Qual espaço mínimo é necessário para construir uma espiral de ervas?',
        answer:
          'Um círculo de 1,4 m a 1,8 m de diâmetro é suficiente para montar a espiral com altura confortável e diversos microclimas de cultivo.',
      },
      {
        question: 'Quais ervas plantar no topo e na base da espiral?',
        answer:
          'No topo seco e ensolarado plante alecrim, sálvia, orégano e tomilho; na base mais sombreada e úmida cultive salsinha, cebolinha e coentro.',
      },
      {
        question: 'Por que o formato em espiral economiza água?',
        answer:
          'A gravidade distribui a água da rega do topo para a base naturalmente, evitando desperdício e encharcamento das raízes.',
      },
    ],
  },
  645: {
    slug: 'peixe-boi-caracteristicas-habitat-preservacao-brasil',
    seoTitle: 'Peixe-Boi no Brasil: Habitat, Alimentação e Preservação',
    metaDescription:
      'Conheça o peixe-boi-marinho e o peixe-boi-da-amazônia: como vivem esses mamíferos herbívoros pacíficos e por que enfrentam risco de extinção.',
    focusKeyword: 'peixe-boi características e preservação',
    keywords: [
      'Peixe-boi marinho',
      'Peixe-boi da Amazônia',
      'Fauna brasileira ameaçada',
      'Mamíferos aquáticos',
      'Biodiversidade dos rios',
      'Preservação ambiental',
    ],
    keyTakeaways: [
      'O Brasil abriga duas espécies nativas: o peixe-boi-da-amazônia e o peixe-boi-marinho.',
      'Embora pesem até 500 kg, alimentam-se exclusivamente de plantas aquáticas e algas.',
      'Colisões com embarcações, redes de pesca e perda de manguezais são as maiores ameaças.',
    ],
    faqs: [
      {
        question: 'Qual a diferença entre o peixe-boi-marinho e o da Amazônia?',
        answer:
          'O peixe-boi-da-amazônia vive em água doce e tem pele escura com mancha branca no peito; o peixe-boi-marinho habita estuários costeiros do Nordeste ao Norte e atinge maior porte.',
      },
      {
        question: 'Do que se alimenta o peixe-boi?',
        answer:
          'É um animal estritamente herbívoro que consome capim-agulha, aguapés e algas, ajudando a controlar o excesso de vegetação nos rios e estuários.',
      },
      {
        question: 'Por que o peixe-boi corre risco de extinção?',
        answer:
          'A reprodução lenta (um filhote a cada 3 a 5 anos), somada à poluição costeira, desmatamento de mangues e colisões com motores de barcos, reduz suas populações.',
      },
    ],
  },
  639: {
    slug: 'natacao-beneficios-iniciantes-guia-completo',
    seoTitle: 'Natação para Iniciantes: Benefícios, Técnicas e Como Começar',
    metaDescription:
      'Descubra os benefícios da natação para o corpo e a mente, técnicas essenciais de respiração e os cuidados ideais para começar com segurança.',
    focusKeyword: 'benefícios da natação para iniciantes',
    keywords: [
      'Natação para iniciantes',
      'Benefícios da natação',
      'Técnicas básicas de nado',
      'Respiração na natação',
      'Esporte de baixo impacto',
      'Saúde cardiovascular',
    ],
    keyTakeaways: [
      'A natação ativa grandes grupos musculares com impacto articular quase zero.',
      'Dominar o controle da respiração e a flutuação vem antes de buscar velocidade.',
      'Praticar duas a três vezes por semana melhora a capacidade pulmonar e reduz o estresse.',
    ],
    faqs: [
      {
        question: 'Quantas vezes por semana um iniciante deve nadar?',
        answer:
          'De 2 a 3 sessões semanais de 30 a 45 minutos são ideais para ganhar coordenação respiratória e condicionamento sem sobrecarga.',
      },
      {
        question: 'Natação ajuda a aliviar dores na coluna?',
        answer:
          'Sim. A flutuação reduz o peso sobre a coluna vertebral e fortalece a musculatura estabilizadora do tronco com segurança.',
      },
      {
        question: 'Qual o primeiro passo para quem tem medo de água?',
        answer:
          'Começar na parte rasa praticando imersão do rosto, soltar o ar suavemente pelo nariz na água e treinar a flutuação horizontal com apoio.',
      },
    ],
  },
  599: {
    slug: 'origem-do-natal-historia-saturnalia-sol-invictus',
    seoTitle: 'A Origem do Natal: História, Saturnália e 25 de Dezembro',
    metaDescription:
      'Descubra por que o Natal é comemorado em 25 de dezembro e como tradições romanas como a Saturnália e o Sol Invictus influenciaram a festa.',
    focusKeyword: 'origem do Natal e 25 de dezembro',
    keywords: [
      'Origem do Natal',
      'Por que 25 de dezembro',
      'Saturnália romana',
      'Sol Invictus',
      'História das tradições',
      'Árvore de Natal história',
    ],
    keyTakeaways: [
      'Os evangelhos não informam a data exata do nascimento de Jesus.',
      'O solstício de inverno no hemisfério norte já inspirava festas antigas de renascimento da luz.',
      'Símbolos modernos como árvore decorada e presentes consolidaram-se entre os séculos XVI e XIX.',
    ],
    faqs: [
      {
        question: 'Por que o Natal foi fixado no dia 25 de dezembro?',
        answer:
          'A data foi estabelecida no século IV em Roma, coincidindo com o período do solstício de inverno e das festividades do Sol Invictus, facilitando a transição cultural.',
      },
      {
        question: 'O que era a Saturnália na Roma Antiga?',
        answer:
          'Era uma grande celebração de dezembro dedicada ao deus Saturno, marcada por banquetes, troca de presentes e suspensão temporária das normas sociais.',
      },
      {
        question: 'Onde surgiu a tradição da árvore de Natal?',
        answer:
          'O costume dos pinheiros decorados ganhou força na Alemanha renascentista e popularizou-se pelo mundo a partir do século XIX.',
      },
    ],
  },
  594: {
    slug: 'robert-hooke-lei-elasticidade-microscopio-ciencia',
    seoTitle: 'Robert Hooke: Lei da Elasticidade, Células e Acústica Moderna',
    metaDescription:
      'Conheça o legado de Robert Hooke, o polímata que descobriu o termo célula no microscópio, formulou a Lei de Hooke e estudou as vibrações sonoras.',
    focusKeyword: 'quem foi Robert Hooke e suas descobertas',
    keywords: [
      'Robert Hooke biografia',
      'Lei de Hooke elasticidade',
      'Micrographia célula',
      'História da ciência',
      'Rivalidade Hooke e Newton',
      'Física das vibrações',
    ],
    keyTakeaways: [
      'Em 1665, Hooke publicou Micrographia e cunhou a palavra "célula" ao observar cortiça.',
      'Sua Lei da Elasticidade fundamenta toda a engenharia estrutural e mecânica de molas.',
      'Apesar de gênio experimental, Hooke foi eclipsado por disputas históricas com Isaac Newton.',
    ],
    faqs: [
      {
        question: 'Qual foi a principal descoberta biológica de Robert Hooke?',
        answer:
          'Ao observar finas fatias de cortiça ao microscópio, Hooke identificou pequenas cavidades semelhantes a favos e criou o termo "célula".',
      },
      {
        question: 'O que diz a Lei de Hooke na Física?',
        answer:
          'Ela afirma que a deformação elástica de uma mola ou corpo sólido é diretamente proporcional à força aplicada, dentro do limite elástico.',
      },
      {
        question: 'Por que Robert Hooke é menos famoso que Isaac Newton?',
        answer:
          'Disputas acadêmicas sobre óptica e gravitação com Newton na Royal Society, além da perda de seu único retrato original, contribuíram para seu esquecimento.',
      },
    ],
  },
  589: {
    slug: 'nikola-tesla-corrente-alternada-invencoes-legado',
    seoTitle: 'Nikola Tesla: Corrente Alternada, Invenções e Legado Científico',
    metaDescription:
      'Entenda como Nikola Tesla criou a base da rede elétrica moderna com a corrente alternada, o motor de indução e tecnologias que anteciparam o século XXI.',
    focusKeyword: 'Nikola Tesla invenções e corrente alternada',
    keywords: [
      'Nikola Tesla biografia',
      'Corrente alternada',
      'Guerra das Correntes',
      'Bobina de Tesla',
      'Motor de indução',
      'História da eletricidade',
    ],
    keyTakeaways: [
      'A corrente alternada (CA) de Tesla venceu a Guerra das Correntes por transmitir energia a longas distâncias.',
      'Suas patentes sustentaram o motor de indução, o controle remoto e a transmissão por rádio.',
      'Tesla visionou energia limpa sem fios e redes globais de comunicação ainda no início do século XX.',
    ],
    faqs: [
      {
        question: 'Qual foi a invenção mais importante de Nikola Tesla?',
        answer:
          'O sistema polifásico de corrente alternada e o motor de indução elétrica, responsáveis pela distribuição de energia em residências e indústrias até hoje.',
      },
      {
        question: 'O que foi a Guerra das Correntes entre Tesla e Thomas Edison?',
        answer:
          'Foi a disputa comercial e técnica no fim do século XIX entre a corrente contínua defendida por Edison e a corrente alternada desenvolvida por Tesla e Westinghouse.',
      },
      {
        question: 'Para que servia a Bobina de Tesla?',
        answer:
          'Era um transformador ressonante capaz de gerar tensões altíssimas e frequências elevadas, fundamental em estudos de transmissão sem fio e rádio.',
      },
    ],
  },
  584: {
    slug: 'albert-einstein-teoria-relatividade-fisica-moderna',
    seoTitle: 'Albert Einstein: Teoria da Relatividade e Revolução na Física',
    metaDescription:
      'Compreenda de forma clara as ideias de Albert Einstein, a equação E=mc², o espaço-tempo e como a relatividade transformou a tecnologia moderna.',
    focusKeyword: 'teoria da relatividade de Albert Einstein',
    keywords: [
      'Albert Einstein biografia',
      'Teoria da Relatividade',
      'Espaço-tempo explicado',
      'Equação E=mc2',
      'Efeito fotoelétrico',
      'Física moderna',
    ],
    keyTakeaways: [
      'Em 1905, o "Ano Miraculoso", Einstein publicou 4 artigos que mudaram a física contemporânea.',
      'A Relatividade Geral mostra que a gravidade é a curvatura do espaço-tempo provocada pela massa.',
      'Sem correções relativísticas, sistemas de GPS e satélites modernos perderiam precisão em minutos.',
    ],
    faqs: [
      {
        question: 'Por qual descoberta Albert Einstein ganhou o Prêmio Nobel?',
        answer:
          'Einstein recebeu o Nobel de Física de 1921 principalmente pela explicação do efeito fotoelétrico, base da tecnologia de painéis solares e sensores ópticos.',
      },
      {
        question: 'Qual a diferença entre Relatividade Restrita e Relatividade Geral?',
        answer:
          'A Relatividade Restrita (1905) trata de movimentos em velocidade constante e da constância da luz; a Geral (1915) inclui aceleração e explica a gravidade como curvatura do espaço-tempo.',
      },
      {
        question: 'Onde usamos a teoria de Einstein no dia a dia?',
        answer:
          'Em celulares com GPS, geração fotovoltaica de energia, lasers, tomógrafos e sincronização precisa de redes de telecomunicação.',
      },
    ],
  },
  579: {
    slug: 'isaac-newton-leis-movimento-gravitacao-optica',
    seoTitle: 'Isaac Newton: As 3 Leis do Movimento, Gravitação e Óptica',
    metaDescription:
      'Entenda as três Leis de Newton, a Lei da Gravitação Universal e suas descobertas sobre a decomposição da luz branca e o cálculo moderno.',
    focusKeyword: 'Leis de Newton e gravitação universal',
    keywords: [
      'Isaac Newton',
      'Três leis do movimento',
      'Gravitação universal',
      'Óptica e prisma',
      'Principia Mathematica',
      'História da física',
    ],
    keyTakeaways: [
      'Newton unificou o movimento na Terra e a órbita dos planetas sob as mesmas leis matemáticas.',
      'Com um prisma, provou que a luz branca é composta pela soma de todas as cores do espectro.',
      'O livro Principia (1687) tornou-se a obra fundadora da física clássica e da engenharia.',
    ],
    faqs: [
      {
        question: 'Quais são as três Leis de Newton?',
        answer:
          'Primeira Lei (Inércia), Segunda Lei (Princípio Fundamental da Dinâmica, F=m·a) e Terceira Lei (Ação e Reação).',
      },
      {
        question: 'O que Isaac Newton descobriu sobre a luz e as cores?',
        answer:
          'Ele demonstrou usando prismas de vidro que a luz branca do Sol não é pura, mas formada pela mistura das sete cores visíveis do arco-íris.',
      },
      {
        question: 'As Leis de Newton ainda são válidas no século XXI?',
        answer:
          'Sim. Apesar da relatividade de Einstein para velocidades extremas, a mecânica newtoniana continua sendo a base para construir pontes, aviões e trajetórias espaciais.',
      },
    ],
  },
  574: {
    slug: 'leonardo-da-vinci-arte-ciencia-invencoes-renascimento',
    seoTitle: 'Leonardo da Vinci: Arte, Ciência e Invenções do Renascimento',
    metaDescription:
      'Explore a mente polímata de Leonardo da Vinci: como seus estudos de anatomia, engenharia e observação da natureza moldaram Mona Lisa e invenções visionárias.',
    focusKeyword: 'Leonardo da Vinci arte e invenções',
    keywords: [
      'Leonardo da Vinci',
      'Renascimento Italiano',
      'Mona Lisa história',
      'Invenções de Da Vinci',
      'Anatomia e arte',
      'Homem Vitruviano',
    ],
    keyTakeaways: [
      'Para Da Vinci, pintura e investigação científica nasciam do mesmo método de observação direta.',
      'Seus cadernos esboçaram máquinas voadoras, engrenagens hidráulicas e estudos anatômicos inéditos.',
      'Técnicas como o sfumato criaram profundidade atmosférica e realismo revolucionários na pintura.',
    ],
    faqs: [
      {
        question: 'Por que Leonardo da Vinci é chamado de gênio universal do Renascimento?',
        answer:
          'Porque atuou com maestria simultânea em pintura, anatomia, engenharia hidráulica, óptica, arquitetura e cartografia, mantendo milhares de páginas de anotações.',
      },
      {
        question: 'O que é a técnica sfumato usada na Mona Lisa?',
        answer:
          'É a transição suave entre luz e sombra sem contornos rígidos, criando sensação de volume real e atmosfera envolvente.',
      },
      {
        question: 'As máquinas voadoras desenhadas por Da Vinci funcionariam?',
        answer:
          'Os princípios aerodinâmicos observados em asas de pássaros eram precisos, embora os materiais e a força muscular humana da época impedissem o voo sustentável.',
      },
    ],
  },
  570: {
    slug: 'pablo-picasso-obras-iconicas-cubismo-guernica',
    seoTitle: 'Pablo Picasso: 10 Obras Icônicas, Cubismo e Guernica',
    metaDescription:
      'Descubra a trajetória de Pablo Picasso das fases Azul e Rosa ao Cubismo, analisando obras-primas como Guernica e Les Demoiselles d’Avignon.',
    focusKeyword: 'obras de Pablo Picasso e cubismo',
    keywords: [
      'Pablo Picasso',
      'Obras de Picasso',
      'Guernica análise',
      'Cubismo na arte',
      'Les Demoiselles d’Avignon',
      'Arte moderna século XX',
    ],
    keyTakeaways: [
      'Picasso reinventou a pintura moderna ao romper com a perspectiva renascentista tradicional.',
      'Ao lado de Georges Braque, criou o Cubismo mostrando objetos sob múltiplos ângulos ao mesmo tempo.',
      'Guernica (1937) transformou a arte em manifesto universal contra os horrores da guerra.',
    ],
    faqs: [
      {
        question: 'Qual a obra mais famosa de Pablo Picasso?',
        answer:
          'Guernica (1937) é sua tela mais emblemática como símbolo antiguerra, ao lado de Les Demoiselles d’Avignon (1907), marco inaugural do cubismo.',
      },
      {
        question: 'O que diferenciou a Fase Azul da Fase Rosa de Picasso?',
        answer:
          'A Fase Azul (1901–1904) retrata solidão e melancolia em tons frios; a Fase Rosa (1904–1906) usa cores terrosas e quentes inspiradas em artistas circenses.',
      },
      {
        question: 'O que é o Cubismo criado por Picasso?',
        answer:
          'Movimento de vanguarda que fragmenta figuras e paisagens em planos geométricos, apresentando diferentes pontos de vista em uma mesma superfície.',
      },
    ],
  },
  560: {
    slug: 'vincent-van-gogh-vida-cores-noite-estrelada-legado',
    seoTitle: 'Vincent Van Gogh: História, Cores Expressivas e Legado na Arte',
    metaDescription:
      'Conheça a biografia emocionante de Vincent Van Gogh, o uso revolucionário das cores em obras como A Noite Estrelada e seu impacto no expressionismo.',
    focusKeyword: 'história e obras de Vincent Van Gogh',
    keywords: [
      'Vincent Van Gogh',
      'A Noite Estrelada',
      'Pós-impressionismo',
      'Girassóis Van Gogh',
      'História da pintura',
      'Cartas a Theo',
    ],
    keyTakeaways: [
      'Van Gogh produziu mais de 2.000 obras em apenas uma década de carreira artística intensa.',
      'Suas pinceladas espessas (impasto) e contrastes cromáticos traduziam estados emocionais profundos.',
      'Embora pouco reconhecido em vida, tornou-se um dos pilares da pintura moderna mundial.',
    ],
    faqs: [
      {
        question: 'Quantos quadros Van Gogh vendeu em vida?',
        answer:
          'O único quadro vendido com registro confirmado em vida foi O Vinhedo Vermelho (1888), adquirido pouco antes de seu falecimento; seu reconhecimento explodiu após 1890.',
      },
      {
        question: 'Por que a cor amarela é tão marcante em suas telas?',
        answer:
          'Durante sua temporada em Arles, no sul da França, a luz solar intensa encantou o pintor, que associou o amarelo à vitalidade, ao calor humano e à esperança.',
      },
      {
        question: 'Qual a importância das cartas trocadas com seu irmão Theo?',
        answer:
          'As mais de 600 cartas preservadas documentam suas técnicas, referências artísticas, angústias e a parceria financeira e afetiva de Theo.',
      },
    ],
  },
  554: {
    slug: 'historia-da-aviacao-santos-dumont-irmaos-wright',
    seoTitle: 'História da Aviação: Santos Dumont, Irmãos Wright e o 14-Bis',
    metaDescription:
      'Compare os feitos dos Irmãos Wright e de Alberto Santos Dumont na conquista dos céus e entenda como o avião revolucionou a mobilidade global.',
    focusKeyword: 'história da aviação Santos Dumont e Irmãos Wright',
    keywords: [
      'História da aviação',
      'Alberto Santos Dumont',
      '14-Bis Paris 1906',
      'Irmãos Wright',
      'Primeiro voo controlado',
      'Engenharia aeronáutica',
    ],
    keyTakeaways: [
      'Os Irmãos Wright realizaram voos em 1903 nos EUA com auxílio de trilhos e vento favorável.',
      'Em 1906, Santos Dumont decolou com o 14-Bis em Paris por propulsão própria diante do público e júri oficial.',
      'Em pouco mais de um século, a aviação conectou continentes e transformou o comércio e a ciência.',
    ],
    faqs: [
      {
        question: 'Qual a principal diferença entre o voo dos Irmãos Wright e o do 14-Bis?',
        answer:
          'O Flyer dos Wright decolou em 1903 sobre trilhos e posteriormente usou catapulta sem testemunhas independentes da imprensa internacional; o 14-Bis de Santos Dumont decolou por meios próprios em Paris diante de júri oficial em 1906.',
      },
      {
        question: 'Santos Dumont também contribuiu para a invenção do relógio de pulso?',
        answer:
          'Sim. Para cronometrar voos mantendo as mãos livres nos comandos, Dumont pediu ao amigo Louis Cartier um relógio preso ao pulso, popularizando o acessório.',
      },
      {
        question: 'Por que Santos Dumont chamava o 14-Bis de aparelho mais pesado que o ar?',
        answer:
          'Porque antes dele, balões e dirigíveis voavam por serem mais leves que o ar (usando hidrogênio), enquanto o avião sustenta-se pela aerodinâmica das asas.',
      },
    ],
  },
  543: {
    slug: 'impacto-motor-combustao-gasolina-seculo-xx',
    seoTitle: 'Combustão a Gasolina no Século XX: Mobilidade e Impacto Global',
    metaDescription:
      'Analise como o motor a combustão e a linha de montagem democratizaram o automóvel, moldaram as cidades do século XX e geraram novos desafios ambientais.',
    focusKeyword: 'impacto do motor a combustão no século XX',
    keywords: [
      'Motor a combustão a gasolina',
      'História do automóvel',
      'Produção em massa século XX',
      'Urbanização e rodovias',
      'Impacto ambiental dos combustíveis',
      'Engenharia mecânica',
    ],
    keyTakeaways: [
      'O motor de quatro tempos uniu potência compacta e abastecimento rápido, superando vapor e baterias antigas.',
      'A linha de montagem tornou o carro acessível à classe média e redesenhou bairros e rodovias.',
      'A dependência do petróleo impulsionou o crescimento econômico, mas acelerou emissões atmosféricas.',
    ],
    faqs: [
      {
        question: 'Por que os carros a gasolina superaram os primeiros elétricos no início do século XX?',
        answer:
          'A descoberta de grandes reservas de petróleo barato, maior autonomia por tanque e a invenção da partida elétrica tornaram a gasolina muito mais prática na época.',
      },
      {
        question: 'Como o automóvel mudou o desenho das cidades?',
        answer:
          'Permitiu a expansão dos subúrbios residenciais afastados dos centros industriais e impulsionou a pavimentação maciça de avenidas e autoestradas.',
      },
      {
        question: 'Qual o principal desafio deixado pelo século da combustão fóssil?',
        answer:
          'Reduzir a poluição urbana e as emissões de CO₂ por meio de eficiência energética, biocombustíveis e eletrificação gradual das frotas.',
      },
    ],
  },
  536: {
    slug: 'historia-do-trem-ferrovias-urbanizacao-seculo-xxi',
    seoTitle: 'História do Trem: Das Locomotivas a Vapor aos Trens-Bala',
    metaDescription:
      'Veja como o trem impulsionou a Revolução Industrial, conectou territórios, perdeu espaço para o carro e agora retorna com a alta velocidade sustentável.',
    focusKeyword: 'história do trem e ferrovias',
    keywords: [
      'História do trem',
      'Ferrovias e urbanização',
      'Locomotiva a vapor',
      'Trem de alta velocidade',
      'Transporte ferroviário sustentável',
      'Revolução Industrial',
    ],
    keyTakeaways: [
      'As ferrovias reduziram drasticamente o tempo de viagem e integraram mercados nacionais no século XIX.',
      'A necessidade de horários ferroviários padronizados deu origem aos fusos horários modernos.',
      'Trens elétricos e de levitação magnética lideram hoje a mobilidade de baixo carbono.',
    ],
    faqs: [
      {
        question: 'Como as ferrovias influenciaram a criação dos fusos horários?',
        answer:
          'Antes dos trens, cada cidade usava seu próprio horário solar; para evitar colisões e atrasos na malha ferroviária, padronizou-se o tempo nacional e global.',
      },
      {
        question: 'Por que muitos países reduziram suas linhas de passageiros no século XX?',
        answer:
          'O investimento público pesado em rodovias, automóveis individuais e aviação comercial desviou passageiros e cargas das ferrovias tradicionais.',
      },
      {
        question: 'Por que o trem voltou a ser estratégico no século XXI?',
        answer:
          'Trens de alta velocidade consomem menos energia por passageiro que aviões e automóveis, reduzindo congestionamentos e emissões de carbono.',
      },
    ],
  },
  529: {
    slug: 'ansiedade-burnout-trabalho-sinais-como-reagir',
    seoTitle: 'Ansiedade e Burnout no Trabalho: Sinais de Alerta e Prevenção',
    metaDescription:
      'Aprenda a reconhecer sintomas de ansiedade ocupacional e síndrome de burnout, entenda fatores de risco e veja estratégias práticas para recuperar o equilíbrio.',
    focusKeyword: 'sinais de ansiedade e burnout no trabalho',
    keywords: [
      'Ansiedade e burnout',
      'Sinais de esgotamento profissional',
      'Saúde mental no trabalho',
      'Prevenção ao estresse crônico',
      'Equilíbrio vida e trabalho',
      'Quando procurar ajuda psicológica',
    ],
    keyTakeaways: [
      'O burnout é um esgotamento ligado ao estresse crônico no trabalho não gerenciado com sucesso.',
      'Insônia persistente, cinismo, lapsos de memória e exaustão física são alertas precoces.',
      'Limites claros de horário, pausas cognitivas e suporte profissional aceleram a recuperação.',
    ],
    faqs: [
      {
        question: 'Qual a diferença entre estresse comum e síndrome de burnout?',
        answer:
          'O estresse costuma ser pontual e melhora com descanso curto; o burnout envolve exaustão prolongada, distanciamento emocional do trabalho e queda na sensação de eficácia.',
      },
      {
        question: 'Quais sinais físicos indicam que a ansiedade passou do limite?',
        answer:
          'Taquicardia frequente, tensão muscular cervical, alterações gastrointestinais, fadiga ao acordar e dificuldade crônica para desligar a mente à noite.',
      },
      {
        question: 'Quando buscar acompanhamento médico ou psicológico?',
        answer:
          'Sempre que os sintomas persistirem por semanas, afetarem o sono, o apetite, os relacionamentos ou causarem crises de pânico e desesperança.',
      },
    ],
  },
  515: {
    slug: 'acidente-vascular-cerebral-avc-prevencao-sinais',
    seoTitle: 'Acidente Vascular Cerebral (AVC): 6 Hábitos de Prevenção e Sinais',
    metaDescription:
      'Saiba como prevenir o AVC controlando pressão arterial, alimentação e estresse, e conheça os sinais rápidos de alerta que salvam vidas.',
    focusKeyword: 'como prevenir acidente vascular cerebral AVC',
    keywords: [
      'Prevenção de AVC',
      'Acidente Vascular Cerebral sintomas',
      'Controle da pressão arterial',
      'Saúde cardiovascular e neurológica',
      'Fatores de risco do derrame',
      'Hábitos saudáveis prevenção',
    ],
    keyTakeaways: [
      'A hipertensão arterial controlada é a medida mais eficaz para prevenir até 80% dos casos de AVC.',
      'Alimentação equilibrada, atividade física regular e controle do diabetes protegem os vasos cerebrais.',
      'Reconhecer assimetria facial, fraqueza num braço e fala arrastada exige emergência imediata (SAMU 192).',
    ],
    faqs: [
      {
        question: 'Quais são os principais sinais de alerta imediato de um AVC?',
        answer:
          'Sorriso torto ou dormência em um lado do rosto, perda súbita de força em um braço ou perna, fala enrolada ou confusa e perda repentina de visão ou equilíbrio.',
      },
      {
        question: 'Qual é a diferença entre AVC isquêmico e hemorrágico?',
        answer:
          'O AVC isquêmico ocorre quando um coágulo bloqueia o fluxo de sangue no cérebro (cerca de 85% dos casos); o hemorrágico acontece pelo rompimento de um vaso sanguíneo.',
      },
      {
        question: 'Quais fatores de risco do AVC podem ser modificados no dia a dia?',
        answer:
          'Pressão alta, tabagismo, sedentarismo, colesterol elevado, diabetes descompensado, excesso de álcool e estresse crônico.',
      },
    ],
  },
  508: {
    slug: 'moda-sustentavel-slow-fashion-guia-pratico',
    seoTitle: 'Moda Sustentável: O Que É Slow Fashion e Como Aplicar Hoje',
    metaDescription:
      'Entenda a diferença entre fast fashion e slow fashion, conheça tecidos ecológicos e veja como montar um guarda-roupa consciente, durável e econômico.',
    focusKeyword: 'o que é moda sustentável e slow fashion',
    keywords: [
      'Moda sustentável',
      'Slow fashion x fast fashion',
      'Guarda-roupa cápsula',
      'Tecidos ecológicos',
      'Consumo consciente roupas',
      'Reciclagem têxtil',
    ],
    keyTakeaways: [
      'A indústria têxtil está entre as mais intensivas em uso de água e geração de resíduos.',
      'O slow fashion prioriza peças duráveis, fibras naturais ou recicladas e cadeias éticas de trabalho.',
      'Brechós, trocas, consertos e escolha de tecidos resistentes reduzem gastos a longo prazo.',
    ],
    faqs: [
      {
        question: 'Qual a diferença prática entre fast fashion e slow fashion?',
        answer:
          'Fast fashion produz coleções descartáveis em altíssima velocidade e baixo custo ambientalmente caro; slow fashion valoriza durabilidade, produção local e transparência.',
      },
      {
        question: 'Como começar um guarda-roupa mais sustentável sem gastar muito?',
        answer:
          'Antes de comprar, avalie o que já possui, priorize peças versáteis de qualidade, explore brechós e cuide da lavagem correta para dobrar a vida útil das roupas.',
      },
      {
        question: 'Quais materiais têxteis têm menor impacto ambiental?',
        answer:
          'Algodão orgânico certificado, linho, cânhamo, liocel (Tencel) de manejo florestal e poliéster reciclado de pós-consumo.',
      },
    ],
  },
  497: {
    slug: 'comidas-tipicas-rio-grande-do-sul-churrasco-culinaria',
    seoTitle: 'Comidas Típicas do Rio Grande do Sul: 7 Pratos e Segredos',
    metaDescription:
      'Descubra os clássicos da gastronomia gaúcha: churrasco no fogo de chão, arroz carreteiro, café de cambona, pinhão na brasa, cuca alemã e muito mais.',
    focusKeyword: 'comidas típicas do Rio Grande do Sul',
    keywords: [
      'Comidas típicas gaúchas',
      'Culinária do Rio Grande do Sul',
      'Churrasco gaúcho autêntico',
      'Arroz carreteiro receita história',
      'Café de cambona e pinhão',
      'Gastronomia regional brasileira',
    ],
    keyTakeaways: [
      'A cozinha gaúcha combina raízes indígenas e campeiras com forte herança alemã e italiana.',
      'Sal grosso na hora certa e brasa firme sem labareda são a essência do churrasco tradicional.',
      'Pratos como arroz carreteiro e barreado nasceram da conservação prática de alimentos em viagens.',
    ],
    faqs: [
      {
        question: 'Qual a origem histórica do arroz carreteiro gaúcho?',
        answer:
          'Surgiu entre os carreteiros que cruzavam os pampas transportando mercadorias em carretas de bois e preparavam arroz com charque (carne seca) em uma única panela de ferro.',
      },
      {
        question: 'O que torna o churrasco gaúcho diferente de outros assados?',
        answer:
          'Cortes grandes espetados, tempero minimalista apenas com sal grosso para preservar o sabor da carne e cozimento lento sobre brasa de lenha ou carvão.',
      },
      {
        question: 'O que é o tradicional café de cambona?',
        answer:
          'É o café cozido diretamente em chaleira ou leiteira de ferro no fogão a lenha, muitas vezes finalizado com uma brasa acesa mergulhada rapidamente para decantar o pó.',
      },
    ],
  },
  484: {
    slug: 'importancia-das-abelhas-polinizacao-biodiversidade',
    seoTitle: 'Importância das Abelhas: Polinização, Alimentos e Ecossistemas',
    metaDescription:
      'Entenda por que as abelhas são essenciais para a segurança alimentar global, a biodiversidade das florestas e o equilíbrio climático e econômico.',
    focusKeyword: 'importância das abelhas para a biodiversidade',
    keywords: [
      'Importância das abelhas',
      'Polinização agrícola',
      'Abelhas sem ferrão brasileiras',
      'Segurança alimentar',
      'Biodiversidade e ecossistemas',
      'Preservação de polinizadores',
    ],
    keyTakeaways: [
      'Mais de 70% das culturas agrícolas consumidas por humanos dependem em algum grau de polinizadores.',
      'As abelhas funcionam como bioindicadores sensíveis à qualidade do ar, água e uso de agrotóxicos.',
      'Plantar flores nativas e evitar pesticidas em jardins urbanos ajuda a proteger espécies sem ferrão.',
    ],
    faqs: [
      {
        question: 'Por que as abelhas são tão importantes para a produção de alimentos?',
        answer:
          'Ao transportar pólen entre flores, elas garantem a frutificação e a qualidade de culturas como café, maçã, maracujá, laranja, abacate e castanhas.',
      },
      {
        question: 'O que aconteceria com a biodiversidade se as abelhas desaparecessem?',
        answer:
          'Milhares de espécies vegetais perderiam sua principal forma de reprodução, reduzindo drasticamente frutas, sementes e o alimento de inúmeros animais silvestres.',
      },
      {
        question: 'Como ajudar a preservar as abelhas em cidades e quintais?',
        answer:
          'Cultivando flores melíferas variadas durante o ano todo, oferecendo pequenas fontes rasas de água com pedrinhas e evitando venenos químicos em hortas.',
      },
    ],
  },
  475: {
    slug: 'dicas-montar-jardim-encantador-plantas-resistentes',
    seoTitle: 'Como Transformar Qualquer Espaço em um Jardim: 7 Dicas Práticas',
    metaDescription:
      'Veja 7 dicas práticas de paisagismo para montar um jardim bonito e fácil de cuidar em varandas, corredores ou quintais usando plantas resistentes e luz.',
    focusKeyword: 'dicas para fazer jardim em casa',
    keywords: [
      'Como montar um jardim',
      'Paisagismo para iniciantes',
      'Plantas resistentes e fáceis',
      'Iluminação de jardim',
      'Jardim em varanda pequena',
      'Cuidados com plantas',
    ],
    keyTakeaways: [
      'Observar quantas horas de sol direto batem no espaço evita a escolha errada de espécies.',
      'Combinar alturas, folhas largas e texturas finas cria profundidade mesmo em áreas compactas.',
      'Iluminação indireta acolhedora transforma o jardim em ambiente de descanso à noite.',
    ],
    faqs: [
      {
        question: 'Quais são as plantas mais resistentes para quem está começando?',
        answer:
          'Espada-de-são-jorge, jiboia, zamioculca, lavanda (para sol pleno), alecrim e suculentas toleram bem pequenas variações de rega.',
      },
      {
        question: 'Como criar sensação de amplitude em um jardim pequeno?',
        answer:
          'Use jardins verticais nas paredes, vasos em três alturas diferentes e caminhos diagonais que alongam o campo visual.',
      },
      {
        question: 'Qual o erro mais comum ao montar o primeiro jardim?',
        answer:
          'Regar em excesso sem boa drenagem no fundo dos vasos ou colocar plantas de sombra sob sol forte da tarde.',
      },
    ],
  },
  462: {
    slug: 'corrida-de-rua-guia-iniciantes-evolucao-segura',
    seoTitle: 'Corrida de Rua para Iniciantes: Guia de Evolução Sem Lesões',
    metaDescription:
      'Comece na corrida de rua com segurança: escolha o tênis certo, alterne caminhada e trote, monte um plano progressivo e respeite a recuperação muscular.',
    focusKeyword: 'corrida de rua guia para iniciantes',
    keywords: [
      'Corrida de rua para iniciantes',
      'Como começar a correr',
      'Alternar caminhada e corrida',
      'Escolha do tênis de corrida',
      'Prevenção de lesões no esporte',
      'Condicionamento físico',
    ],
    keyTakeaways: [
      'Alternar intervalos de caminhada e corrida leve prepara tendões e articulações antes da velocidade.',
      'O tênis ideal prioriza conforto anatômico, bom amortecimento e espaço livre na ponta dos dedos.',
      'Dias de descanso e fortalecimento muscular são tão importantes quanto os treinos de rodagem.',
    ],
    faqs: [
      {
        question: 'Como deve ser a primeira semana de quem nunca correu?',
        answer:
          'Alternar 1 a 2 minutos de trote bem leve com 2 minutos de caminhada ativa por cerca de 25 a 30 minutos, em 3 dias não consecutivos.',
      },
      {
        question: 'Qual a regra segura para aumentar o volume semanal de corrida?',
        answer:
          'Treinadores recomendam não aumentar a quilometragem total ou o tempo corrido em mais de 10% de uma semana para a outra.',
      },
      {
        question: 'Correr todos os dias faz bem para iniciantes?',
        answer:
          'Não. Os músculos se recuperam rápido, mas tendões e ossos levam mais tempo para se adaptar ao impacto; intervalos de descanso evitam canelite e tendinites.',
      },
    ],
  },
  420: {
    slug: 'filmes-series-super-herois-classicos-1978-2000',
    seoTitle: 'Heróis no Cinema e TV (1978–2000): Os Clássicos Que Abriram Caminho',
    metaDescription:
      'Relembre os filmes e séries que definiram os super-heróis na tela antes da era moderna: Superman (1978), O Incrível Hulk, Batman (1989), Flash e X-Men.',
    focusKeyword: 'filmes clássicos de super-heróis anos 80 e 90',
    keywords: [
      'Filmes de super-heróis clássicos',
      'Superman 1978 Christopher Reeve',
      'Batman 1989 Tim Burton',
      'Série O Incrível Hulk',
      'X-Men O Filme 2000',
      'História do cinema geek',
    ],
    keyTakeaways: [
      'Superman (1978) provou que quadrinhos podiam render épicos cinematográficos sérios e lucrativos.',
      'Batman (1989) inaugurou o tom sombrio gótico e revolucionou o marketing de blockbusters.',
      'X-Men (2000) estabeleceu a ponte definitiva para os universos compartilhados do século XXI.',
    ],
    faqs: [
      {
        question: 'Qual filme inaugurou a era moderna dos super-heróis no cinema?',
        answer:
          'Superman: O Filme (1978), estrelado por Christopher Reeve e dirigido por Richard Donner, foi o primeiro grande blockbuster a levar o gênero a sério com efeitos inovadores.',
      },
      {
        question: 'Qual foi o impacto de Batman (1989) de Tim Burton?',
        answer:
          'Afastou o personagem da estética colorida da série dos anos 60, trazendo estética sombria e consolidando a figura do herói complexo nas telas.',
      },
      {
        question: 'Por que X-Men (2000) foi decisivo para os filmes da Marvel e DC?',
        answer:
          'Ao tratar preconceito e identidade dentro de um filme de ação em equipe com sucesso de bilheteria, convenceu os estúdios a investir maciçamente em adaptações de HQs.',
      },
    ],
  },
  400: {
    slug: 'trilhas-sonoras-anos-80-cinema-orquestras-classicos',
    seoTitle: 'Trilhas Sonoras dos Anos 80: Orquestras e Clássicos do Cinema',
    metaDescription:
      'Viaje pelas trilhas sonoras inesquecíveis dos anos 80 em filmes como De Volta para o Futuro, Os Goonies, Caça-Fantasmas e Star Wars com grandes orquestras.',
    focusKeyword: 'trilhas sonoras clássicas dos anos 80',
    keywords: [
      'Trilhas sonoras anos 80',
      'Música de cinema orquestral',
      'De Volta para o Futuro trilha',
      'Star Wars John Williams',
      'Clássicos musicais década de 80',
      'Cultura pop musical',
    ],
    keyTakeaways: [
      'Os anos 80 uniram grandes temas sinfônicos de John Williams e Alan Silvestri a hits de sintetizador.',
      'Temas como De Volta para o Futuro e Caça-Fantasmas tornam filmes instantaneamente reconhecíveis em segundos.',
      'A trilha sonora atua como narradora emocional invisível guiando tensão, aventura e nostalgia.',
    ],
    faqs: [
      {
        question: 'Por que as trilhas sonoras dos anos 80 são tão marcantes até hoje?',
        answer:
          'Porque combinavam melodias claras e memoráveis (leitmotivs orquestrais) com produções pop vibrantes e sintetizadores que definiam a identidade de cada cena.',
      },
      {
        question: 'Qual papel tiveram compositores como John Williams e Alan Silvestri?',
        answer:
          'Eles mantiveram viva a grande orquestra sinfônica no cinema comercial, criando temas heroicos para Star Wars, Indiana Jones e De Volta para o Futuro.',
      },
      {
        question: 'Como a música ajuda a construir o ritmo de um filme de aventura?',
        answer:
          'A música antecipa o perigo, amplifica o impacto de vitórias e cria memória afetiva duradoura associada aos personagens.',
      },
    ],
  },
  368: {
    slug: 'como-acabar-com-mofo-paredes-armarios-casa-saude',
    seoTitle: 'Como Acabar com o Mofo em Casa: Causas, Riscos e Solução Segura',
    metaDescription:
      'Entenda por que o mofo aparece nas paredes e armários, conheça os riscos respiratórios e siga o passo a passo seguro para eliminar e prevenir fungos.',
    focusKeyword: 'como acabar com o mofo nas paredes e armários',
    keywords: [
      'Como acabar com o mofo',
      'Causas do mofo em casa',
      'Riscos do mofo para a saúde',
      'Tirar bolor de parede e armário',
      'Controle de umidade residencial',
      'Ventilação doméstica',
    ],
    keyTakeaways: [
      'Mofo é causado por fungos microscópicos que proliferam onde há umidade acima de 60% e pouca luz.',
      'Esporos em excesso agravam rinite, asma, alergias respiratórias e irritações oculares.',
      'Limpar só a superfície sem corrigir infiltração ou ventilação faz o bolor retornar rapidamente.',
    ],
    faqs: [
      {
        question: 'Por que o mofo volta mesmo depois de pintar a parede?',
        answer:
          'Se a causa da umidade (infiltração, vazamento ou condensação sem ventilação) não for tratada e a parede não for higienizada antes com produto antifúngico, os fungos atravessam a tinta nova.',
      },
      {
        question: 'Quais são os riscos do mofo para a saúde da família?',
        answer:
          'A inalação contínua de esporos pode desencadear crises de asma, rinite alérgica, tosse persistente e infecções respiratórias, sobretudo em crianças e idosos.',
      },
      {
        question: 'Como evitar mofo dentro de guarda-roupas encostados na parede?',
        answer:
          'Afaste o móvel cerca de 5 cm da parede, abra as portas regularmente para arejar, nunca guarde roupas úmidas e utilize potes antimofo ou sílica nos cantos.',
      },
    ],
  },
  307: {
    slug: 'historia-das-estradas-caminhos-antigos-rodovias-modernas',
    seoTitle: 'História das Estradas: Dos Caminhos Romanos às Grandes Rodovias',
    metaDescription:
      'Percorra a evolução das estradas ao longo dos séculos: das calçadas de pedra do Império Romano e rotas da seda às rodovias asfaltadas do século XX.',
    focusKeyword: 'história das estradas construídas ao longo dos séculos',
    keywords: [
      'História das estradas',
      'Estradas romanas antigas',
      'Infraestrutura viária',
      'Asfalto e rodovias modernas',
      'Engenharia de transportes',
      'Rota da Seda caminhos',
    ],
    keyTakeaways: [
      'As estradas pavimentadas de Roma usavam múltiplas camadas de drenagem que resistem há dois milênios.',
      'Na Era Moderna, técnicas como o macadame de John McAdam revolucionaram o escoamento de cargas.',
      'A expansão do automóvel no século XX transformou caminhos regionais em redes expressas continentais.',
    ],
    faqs: [
      {
        question: 'Por que as estradas do Império Romano duraram tantos séculos?',
        answer:
          'Os engenheiros romanos escavavam fundações profundas com quatro camadas de pedra, cascalho, argamassa e lajes inclinadas no centro para escoar a chuva.',
      },
      {
        question: 'O que foi a técnica de macadame criada no século XIX?',
        answer:
          'Desenvolvida por John Loudon McAdam, consistia em compactar camadas de pedra britada angulosa que se travavam entre si, formando estradas firmes e drenantes.',
      },
      {
        question: 'Qual o ditado "todos os caminhos levam a Roma" explica na prática?',
        answer:
          'Reflete a vasta rede radial de mais de 80 mil km de estradas pavimentadas que convergiam para o Fórum Romano para mover legiões, correios e comércio.',
      },
    ],
  },
  294: {
    slug: 'maravilhas-da-engenharia-antiga-construcoes-misteriosas',
    seoTitle: 'Maravilhas da Engenharia Antiga: Precisão e Obras Monumentais',
    metaDescription:
      'Explore os segredos de obras antigas impressionantes como os Banhos Romanos de Bath, o Forte de Derawar, as Cavernas de Ellora e alinhamentos milenares.',
    focusKeyword: 'maravilhas da engenharia antiga',
    keywords: [
      'Maravilhas da engenharia antiga',
      'Banhos Romanos de Bath',
      'Cavernas de Ellora Índia',
      'Forte de Derawar',
      'Arquitetura da Antiguidade',
      'Obras monumentais antigas',
    ],
    keyTakeaways: [
      'Civilizações antigas dominavam hidráulica, geometria solar e corte de rocha sem máquinas elétricas.',
      'As Cavernas de Ellora foram escavadas de cima para baixo em um único bloco maciço de basalto.',
      'Os Banhos de Bath utilizavam chumbo, aquecimento por hipocausto e fontes termais naturais.',
    ],
    faqs: [
      {
        question: 'Como as Cavernas de Ellora foram construídas na Índia?',
        answer:
          'Em vez de empilhar blocos, artesãos escavaram o rochedo de cima para baixo removendo centenas de milhares de toneladas de basalto para esculpir templos monolíticos.',
      },
      {
        question: 'Como os antigos conseguiam alinhar grandes monumentos com tanta precisão?',
        answer:
          'Utilizando observação paciente das estrelas, sombras solares de gnômons, cordas tensionadas, níveis d’água e conhecimentos avançados de geometria prática.',
      },
      {
        question: 'Qual o destaque de engenharia dos Banhos Romanos de Bath?',
        answer:
          'Seu sistema sofisticado de drenagem em chumbo e dutos térmicos canalizava água mineral naturalmente aquecida sem desperdício estrutural.',
      },
    ],
  },
  280: {
    slug: 'construcoes-ao-longo-dos-seculos-materiais-arquitetura',
    seoTitle: 'Construções ao Longo dos Séculos: Materiais, Técnicas e Cores',
    metaDescription:
      'Veja a evolução da arquitetura humana da pré-história e Antiguidade à Idade Média e Renascimento, dos materiais naturais às cores nas fachadas históricas.',
    focusKeyword: 'história das construções e arquitetura antiga',
    keywords: [
      'Construções ao longo dos séculos',
      'História da arquitetura',
      'Técnicas construtivas antigas',
      'Cores na arquitetura antiga',
      'Materiais de construção históricos',
      'Evolução das habitações',
    ],
    keyTakeaways: [
      'As primeiras habitações refletiam diretamente clima, solo e materiais locais como barro, madeira e pedra.',
      'Arcos ogivais e cúpulas renascentistas permitiram erguer vãos amplos com máxima iluminação natural.',
      'Templos gregos e romanos que hoje parecem brancos eram originalmente pintados com pigmentos vibrantes.',
    ],
    faqs: [
      {
        question: 'Os templos gregos e romanos antigos eram realmente todo brancos?',
        answer:
          'Não. Pesquisas arqueológicas comprovam que esculturas e colunas exibiam azuis, vermelhos, ocres e dourados intensos que se desgastaram com o tempo.',
      },
      {
        question: 'Qual avanço permitiu às catedrais góticas terem vitrais gigantes?',
        answer:
          'O uso combinado de arcos ogivais, abóbadas de ogivas e arcobotantes externos transferiu o peso dos telhados para fora, liberando as paredes para grandes janelas.',
      },
      {
        question: 'Quais materiais dominaram a construção humana antes do concreto armado?',
        answer:
          'Pedra talhada, tijolo de adobe ou cozido ao fogo, argamassa de cal e pozolana, madeira estrutural e fibras vegetais.',
      },
    ],
  },
  183: {
    slug: 'acabamentos-inteligentes-tinta-pisos-economicos-reforma',
    seoTitle: 'Acabamentos Inteligentes: Como Calcular Tinta e Piso Barato',
    metaDescription:
      'Aprenda a calcular exatamente quantos litros de tinta comprar por cômodo e descubra pisos econômicos e duráveis para renovar a casa sem desperdício.',
    focusKeyword: 'acabamentos inteligentes e cálculo de tinta para reforma',
    keywords: [
      'Acabamentos inteligentes reforma',
      'Como calcular tinta por metro quadrado',
      'Pintura econômica casa',
      'Pisos de baixo custo duráveis',
      'Dicas para reformar gastando pouco',
      'Reforma residencial prática',
    ],
    keyTakeaways: [
      'Calcular área descontando portas e janelas evita sobras caras de galões de tinta.',
      'Selador acrílico e preparação correta da parede reduzem a quantidade de demãos necessárias.',
      'Cerâmica esmaltada, piso vinílico e cimento queimado entregam estética moderna com ótimo custo-benefício.',
    ],
    faqs: [
      {
        question: 'Como calcular quantos litros de tinta preciso para pintar um quarto?',
        answer:
          'Some a largura das quatro paredes, multiplique pelo pé-direito, subtraia as áreas de portas e janelas, multiplique pelo número de demãos (em geral 2 a 3) e divida pelo rendimento da lata.',
      },
      {
        question: 'Quais são os pisos mais econômicos e bonitos para reformar rápido?',
        answer:
          'Cerâmicas populares com boa classificação PEI, pisos laminados ou vinílicos clicados (instaláveis sobre piso antigo) e cimento queimado resinado.',
      },
      {
        question: 'Vale a pena comprar tinta mais barata para economizar na pintura?',
        answer:
          'Tintas muito diluídas ou econômicas demais exigem mais demãos e rendem menos por m²; tintas standard ou premium frequentemente saem mais baratas no custo final.',
      },
    ],
  },
  172: {
    slug: 'materiais-de-construcao-economicos-reforma-duravel',
    seoTitle: 'Materiais de Construção Econômicos: 7 Opções Fortes e Baratas',
    metaDescription:
      'Descubra 7 materiais de construção acessíveis e resistentes, do tijolo ecológico ao PVC e escolha correta de cimento para economizar de verdade na obra.',
    focusKeyword: 'materiais de construção econômicos e resistentes',
    keywords: [
      'Materiais de construção econômicos',
      'Tijolo ecológico vantagens',
      'Como economizar na obra',
      'Comparativo madeira MDF PVC',
      'Escolher cimento para reforma',
      'Construção civil econômica',
    ],
    keyTakeaways: [
      'Blocos de concreto, tijolo ecológico e drywall reduzem argamassa, tempo de mão de obra e entulho.',
      'Escolher o tipo certo de cimento (CP II, CP III ou CP IV) evita trincas e gastos extras.',
      'Comparar madeira, MDF, PVC e poliestireno segundo umidade do cômodo evita trocas precoces.',
    ],
    faqs: [
      {
        question: 'O tijolo ecológico realmente reduz o custo total da obra?',
        answer:
          'Sim. Por ter encaixes precisos e furos internos para tubulação e colunas, economiza até 70% em argamassa de assentamento, reboco e tempo de execução.',
      },
      {
        question: 'Entre MDF, madeira maciça e PVC, qual resiste melhor à umidade?',
        answer:
          'O PVC é totalmente impermeável e ideal para forros e rodapés de banheiros e áreas de serviço, enquanto o MDF comum incha ao contato frequente com água.',
      },
      {
        question: 'Qual o maior erro ao comprar materiais baratos para uma reforma?',
        answer:
          'Economizar em itens estruturais ou impermeabilização embutida (tubos, fios, manta líquida), onde retrabalhos futuros custam várias vezes o valor inicial.',
      },
    ],
  },
  154: {
    slug: 'formas-caseiras-solucoes-praticas-limpeza-organizacao',
    seoTitle: 'Formas Caseiras de Cuidar da Casa: Dicas Práticas e Econômicas',
    metaDescription:
      'Confira soluções caseiras seguras e baratas para cozinha, banheiro, quarto e lavanderia usando ingredientes simples para limpar, desodorizar e organizar.',
    focusKeyword: 'formas caseiras para limpeza e organização da casa',
    keywords: [
      'Formas caseiras limpeza',
      'Dicas práticas para casa',
      'Limpar panela queimada caseiro',
      'Bicarbonato e vinagre na limpeza',
      'Organização econômica do lar',
      'Truques domésticos seguros',
    ],
    keyTakeaways: [
      'Bicarbonato de sódio, limão e vinagre de álcool resolvem gordura leve e maus odores sem gastar muito.',
      'Cada cômodo exige rotina rápida semanal que evita acúmulo pesado de sujeira.',
      'Nunca misture água sanitária com vinagre ou amônia, pois gera gases tóxicos perigosos.',
    ],
    faqs: [
      {
        question: 'Posso misturar bicarbonato de sódio com vinagre e água sanitária?',
        answer:
          'Nunca misture água sanitária (hipoclorito de sódio) com vinagre, limão ou outros ácidos, pois a reação libera gás cloro tóxico. Use bicarbonato e vinagre apenas isolados de cloro.',
      },
      {
        question: 'Como limpar panela queimada sem riscar o fundo?',
        answer:
          'Cubra o fundo queimado com água morna e duas colheres de bicarbonato de sódio, deixe agir por 20 minutos (ou aqueça levemente) e esfregue com esponja macia.',
      },
      {
        question: 'Qual o melhor jeito caseiro de tirar mau cheiro de geladeira e ralos?',
        answer:
          'Um potinho aberto com bicarbonato absorve odores na geladeira, enquanto água fervente seguida de bicarbonato ajuda a desodorizar ralos da pia.',
      },
    ],
  },
};

export function createArticleSlug(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getArticleSeo(post: Post, categoryName?: string): ArticleSeoProfile {
  const mapped = ARTICLE_SEO_MAP[post.id];
  if (mapped) {
    return mapped;
  }

  const cleanTitle = post.title.rendered.replace(/<[^>]+>/g, '').trim();
  const cleanExcerpt = post.excerpt.rendered.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    slug: post.slug || createArticleSlug(cleanTitle),
    seoTitle: `${cleanTitle}: Guia Editorial Completo — Achar Temas`.slice(0, 62),
    metaDescription: `${cleanExcerpt.slice(0, 145)} Leia o guia completo no Achar Temas.`.slice(0, 160),
    focusKeyword: cleanTitle,
    keywords: [cleanTitle, categoryName || 'Curiosidades', 'Achar Temas', 'Artigo completo'],
    keyTakeaways: [
      `Análise estruturada sobre ${cleanTitle} com contexto histórico e prático.`,
      'Leitura clara, revisada e organizada por tópicos para consulta rápida.',
    ],
    faqs: [
      {
        question: `Sobre o que trata o artigo ${cleanTitle}?`,
        answer: cleanExcerpt || `Reportagem aprofundada sobre ${cleanTitle} publicada pela Redação Achar Temas.`,
      },
    ],
  };
}
