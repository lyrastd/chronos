var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var geminiApiKey = process.env.GEMINI_API_KEY;
var defaultAi = geminiApiKey ? new import_genai.GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
}) : null;
function getAiClient(req) {
  const clientKey = req.headers["x-gemini-key"];
  if (clientKey && clientKey.trim()) {
    try {
      return new import_genai.GoogleGenAI({
        apiKey: clientKey.trim(),
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    } catch (e) {
      console.error("Failed to compile user custom GoogleGenAI instance:", e);
    }
  }
  return defaultAi;
}
var initialLeaderboard = [
  { id: "1", name: "Helena Kepler", level: 14, xp: 14200, predictionsCorrect: 29, badge: "Or\xE1culo de Bronze" },
  { id: "2", name: "Arthur C. Clarke", level: 12, xp: 12100, predictionsCorrect: 24, badge: "Viajante do Tempo" },
  { id: "3", name: "Niels Bohr", level: 11, xp: 11050, predictionsCorrect: 22, badge: "Analista Qu\xE2ntico" },
  { id: "4", name: "Alan Turing", level: 9, xp: 9500, predictionsCorrect: 18, badge: "Calculador L\xF3gico" },
  { id: "5", name: "Ada Lovelace", level: 8, xp: 8200, predictionsCorrect: 15, badge: "Pioneira Digital" }
];
var globalLeaderboard = [...initialLeaderboard];
app.get("/api/leaderboard", (req, res) => {
  res.json(globalLeaderboard);
});
app.post("/api/leaderboard/update", (req, res) => {
  const { name, level, xp, predictionsCorrect, badge } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Missing name" });
  }
  const existingIndex = globalLeaderboard.findIndex((u) => u.name.toLowerCase() === name.toLowerCase());
  if (existingIndex !== -1) {
    globalLeaderboard[existingIndex] = {
      ...globalLeaderboard[existingIndex],
      level: Math.max(globalLeaderboard[existingIndex].level, level || 1),
      xp: Math.max(globalLeaderboard[existingIndex].xp, xp || 0),
      predictionsCorrect: Math.max(globalLeaderboard[existingIndex].predictionsCorrect, predictionsCorrect || 0),
      badge: badge || globalLeaderboard[existingIndex].badge
    };
  } else {
    globalLeaderboard.push({
      id: String(globalLeaderboard.length + 1),
      name,
      level: level || 1,
      xp: xp || 0,
      predictionsCorrect: predictionsCorrect || 0,
      badge: badge || "Novato"
    });
  }
  globalLeaderboard.sort((a, b) => b.xp - a.xp);
  res.json(globalLeaderboard);
});
app.post("/api/leaderboard/reset", (req, res) => {
  globalLeaderboard = [...initialLeaderboard];
  res.json(globalLeaderboard);
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!geminiApiKey });
});
app.post("/api/predict", async (req, res) => {
  const {
    niche,
    aspects,
    targetDate,
    gdpGrowth = 2.5,
    inflationRate = 3,
    interestRate = 4.5,
    techAdoption = 50,
    regulationStrictness = 50
  } = req.body;
  if (!niche || !targetDate) {
    return res.status(400).json({ error: "Nicho e Data Alvo s\xE3o obrigat\xF3rios." });
  }
  const activeAi = getAiClient(req);
  if (!activeAi) {
    return res.status(503).json({
      error: "API Key do Gemini n\xE3o configurada no servidor nem fornecida nas configura\xE7\xF5es locais."
    });
  }
  const systemInstruction = `Voc\xEA \xE9 um algoritmo hiper-avan\xE7ado de IA Futurologista, especializado em proje\xE7\xF5es de tend\xEAncias, an\xE1lises socioecon\xF4micas, impactos tecnol\xF3gicos e modelagens macroecon\xF4micas refinadas.
Responda APENAS em formato JSON v\xE1lido, de acordo com as especifica\xE7\xF5es exigidas. Escreva toda a resposta em portugu\xEAs brasileiro.`;
  const prompt = `Gere uma an\xE1lise de futurologia extremamente detalhada e criativa para o nicho "${niche}" com foco nos seguintes aspectos de pesquisa: "${aspects || "Geral (Tecnol\xF3gico, Social, Regulat\xF3rio)"}".
A data alvo projetada para a previs\xE3o \xE9 de m\xE9dio/longo prazo: ${targetDate}.

Considere as vari\xE1veis macroecon\xF4micas atuais e cen\xE1rios ajustados pelo usu\xE1rio para refinar os c\xE1lculos:
- Taxa de Crescimento do PIB Projetado: ${gdpGrowth}% ao ano.
- Taxa de Infla\xE7\xE3o Projetada: ${inflationRate}% ao ano.
- Taxa de Juros M\xE9dias Gerais: ${interestRate}% ao ano.
- Velocidade de Ado\xE7\xE3o de Novas Tecnologias: ${techAdoption}% (onde 100% \xE9 ado\xE7\xE3o instant\xE2nea radical).
- Rigidez das Regula\xE7\xF5es Governamentais: ${regulationStrictness}% (onde 100% barra qualquer disrup\xE7\xE3o r\xE1pida).

Calcule a probabilidade matem\xE1tica do cen\xE1rio considerando duas fontes:
1. Probabilidades reais com amostragem estat\xEDstica e dados ("Estat\xEDstica/Heur\xEDstica Cient\xEDfica")
2. Probabilidades baseadas em intui\xE7\xE3o/palpite l\xF3gico ("Achismos L\xF3gicos") considerando as tend\xEAncias regulat\xF3rias e de mercado.

Gere exatamente 3 linhas do tempo (cen\xE1rios) divergentes:
1. "Cen\xE1rio Realista" (Crescimento cont\xEDnuo e equilibrado)
2. "Cen\xE1rio Disruptivo/Exponencial" (Crescimento agressivo tecnol\xF3gico superando regula\xE7\xF5es)
3. "Cen\xE1rio Estagnado/Conservador" (Restri\xE7\xF5es de juros, infla\xE7\xE3o alta ou regula\xE7\xE3o emperrando progresso)

Siga rigorosamente a estrutura JSON abaixo para a sua resposta. N\xE3o inclua Markdown extras al\xE9m de um JSON limpo formatado:
{
  "nicheName": "Nome do nicho ajustado profissionalmente",
  "aiOpinion": "Uma opini\xE3o ou parecer cr\xEDtico final do Futurologista IA (cerca de 3 par\xE1grafos ricos em insights com base nas taxas macroecon\xF4micas ajustadas)",
  "aiHunch": "Um par\xE1grafo sincero de pura opini\xE3o livre, com forte personalidade e sem filtro corporativo. Deve obrigatoriamente come\xE7ar com exatamente: 'Se eu tivesse que apostar minhas engrenagens, eu diria que...' e conter uma aposta ousada baseada nas tend\xEAncias econ\xF4micas e comportamento humano previstos.",
  "scenarios": [
    {
      "type": "realistic",
      "title": "T\xEDtulo criativo e chamativo para o Cen\xE1rio Realista",
      "probability": 70, // n\xFAmero de 0 a 100 representing probability of occurrence
      "summary": "Resumo sint\xE9tico do cen\xE1rio",
      "timelinePoints": [
        {
          "timeframe": "Ponto de Chegada Intermedi\xE1rio",
          "title": "Primeiro Marco Principal",
          "description": "Explica\xE7\xE3o do que acontece nesse primeiro momento intermedi\xE1rio",
          "socioEconomicImpact": "O impacto social e financeiro previsto",
          "techFactor": "A inova\xE7\xE3o tecnol\xF3gica envolvida"
        },
        {
          "timeframe": "Data Alvo Final (${targetDate})",
          "title": "Cl\xEDmax da Previs\xE3o",
          "description": "O estado final do nicho nessa data limite escolhida",
          "socioEconomicImpact": "Como a sociedade e o mercado estar\xE3o estruturados neste cen\xE1rio",
          "techFactor": "As principais tecnologias consolidadas neste cen\xE1rio"
        }
      ]
    },
    {
      "type": "disruptive",
      "title": "T\xEDtulo criativo e futurista para o Cen\xE1rio Disruptivo",
      "probability": 15, // n\xFAmero de 0 a 100
      "summary": "Resumo do cen\xE1rio exponencial",
      "timelinePoints": [
        {
          "timeframe": "Ponto de Chegada Intermedi\xE1rio",
          "title": "Disrup\xE7\xE3o Acelerada",
          "description": "Explica\xE7\xE3o dos primeiros sintomas de disrup\xE7\xE3o radical",
          "socioEconomicImpact": "Impactos brutais no emprego e no mercado financeiro",
          "techFactor": "Novas formas de automa\xE7\xE3o e IA integradas"
        },
        {
          "timeframe": "Data Alvo Final (${targetDate})",
          "title": "Singularidade ou Utopia/Distopia do Nicho",
          "description": "A consolida\xE7\xE3o radical deste avan\xE7o extremo tecnol\xF3gica",
          "socioEconomicImpact": "Cria\xE7\xE3o de novos paradigmas econ\xF4micos",
          "techFactor": "Sistemas aut\xF4nomos cognitivos operando inteiramente"
        }
      ]
    },
    {
      "type": "conservative",
      "title": "T\xEDtulo realista/sombrio para o Cen\xE1rio Estagnado",
      "probability": 15, // n\xFAmero de 0 a 100
      "summary": "Resumo do cen\xE1rio pessimista ou estagnado",
      "timelinePoints": [
        {
          "timeframe": "Ponto de Chegada Intermedi\xE1rio",
          "title": "Gargalo Econ\xF4mico",
          "description": "O in\xEDcio da lentid\xE3o provocada por regula\xE7\xF5es pesadas ou fatores macro desfavor\xE1veis",
          "socioEconomicImpact": "Recess\xE3o relativa, infla\xE7\xE3o corroendo fundos de fomento",
          "techFactor": "Tecnologias travadas em aprova\xE7\xF5es governamentais longas"
        },
        {
          "timeframe": "Data Alvo Final (${targetDate})",
          "title": "O Plat\xF4 de Estagna\xE7\xE3o",
          "description": "Como este nicho se acomoda sem disrup\xE7\xE3o vis\xEDvel",
          "socioEconomicImpact": "Mercado altamente tradicional, oligop\xF3lios de inova\xE7\xE3o controlados",
          "techFactor": "Soberania de tecnologias de legado com pouca evolu\xE7\xE3o pr\xE1tica"
        }
      ]
    }
  ],
  "probabilityBreakdown": {
    "empiricalHeuristics": "Detalhamento de como dados hist\xF3ricos, velocidade de ado\xE7\xE3o tecnol\xF3gica (${techAdoption}%) e PIB (${gdpGrowth}%) geram a probabilidade cient\xEDfica do c\xE1lculo de amostragem.",
    "intuitiveHunch": "Detalhamento e justificativa l\xF3gica (achismo coerente) baseando-se em gargalos inflacion\xE1rios (${inflationRate}%) e rigidez de mercado/regula\xE7\xE3o (${regulationStrictness}%) que guiam os riscos pr\xE1ticos.",
    "scientificScore": 82, // Avalia\xE7\xE3o de grau cient\xEDfico de confian\xE7a do modelo, de 0 a 100
    "intuitiveScore": 73 // Avalia\xE7\xE3o de grau de intui\xE7\xE3o heur\xEDstica, de 0 a 100
  },
  "scoreRecommendation": "Recomenda\xE7\xE3o estrat\xE9gica curta sobre qual cen\xE1rio priorizar no planejamento de investimentos ou carreira.",
  "similarProjections": [
    {
      "userName": "Nome do Or\xE1culo veterano do ranking (Ex: 'Helena Kepler' ou 'Arthur C. Clarke' ou 'Ada Lovelace')",
      "userAccuracy": 94, // Um n\xFAmero de 85 a 99% representando a assertividade acumulada
      "userBadge": "Or\xE1culo de Bronze ou Viajante do Tempo ou Pioneira Digital",
      "nicheSearched": "Nicho aproximadamente similar, ligeiramente alterado para mostrar semelhan\xE7a (Ex: se fosse 'Carros Voadores', use 'Drones de Carga Aut\xF4nomos urbanos' ou semelhante)",
      "macroVariables": {
        "gdpGrowth": 3.8,
        "inflationRate": 2.1,
        "interestRate": 3.5,
        "techAdoption": 82,
        "regulationStrictness": 60
      },
      "scenarioType": "realistic", // 'realistic', 'disruptive' ou 'conservative'
      "scenarioTitle": "T\xEDtulo customizado da previs\xE3o que eles fizeram",
      "probability": 74,
      "curvePoints": [15, 60, 90], // Array de exatamente 3 n\xFAmeros de (0 a 100) mapeando a maturidade estimada nos 3 pontos da curva (inicial, meio, fim)
      "insight": "Um coment\xE1rio ou considera\xE7\xE3o extra de alta perspic\xE1cia que esse or\xE1culo fez conectando seu nicho de pesquisa ao do usu\xE1rio.",
      "timestamp": "2026-05-22T14:30:00Z"
    },
    {
      "userName": "Outro Or\xE1culo do topo do ranking (Ex: 'Niels Bohr' ou 'Alan Turing')",
      "userAccuracy": 89,
      "userBadge": "Analista Qu\xE2ntico ou Calculador L\xF3gico",
      "nicheSearched": "Outro subnicho alternativo altamente conexo",
      "macroVariables": {
        "gdpGrowth": 2.4,
        "inflationRate": 3.2,
        "interestRate": 5.0,
        "techAdoption": 55,
        "regulationStrictness": 70
      },
      "scenarioType": "disruptive",
      "scenarioTitle": "T\xEDtulo da aposta deles",
      "probability": 25,
      "curvePoints": [10, 40, 95], // 3 n\xFAmeros representando curva de maturidade
      "insight": "Uma nota curta complementar provocadora e inteligente explicando seu escopo de acerto.",
      "timestamp": "2026-05-23T09:15:00Z"
    }
  ]
}`;
  try {
    const response = await activeAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.85
      }
    });
    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Resposta do modelo veio vazia.");
    }
    try {
      const parsedData = JSON.parse(textOutput.trim());
      return res.json(parsedData);
    } catch (parseError) {
      console.error("JSON parse error from Gemini output:", textOutput);
      return res.status(500).json({
        error: "Erro ao estruturar a resposta da IA. O modelo gerou dados inv\xE1lidos.",
        rawText: textOutput
      });
    }
  } catch (error) {
    console.error("Gemini API call error:", error);
    return res.status(500).json({
      error: error?.message || "Ocorreu um erro desconhecido ao chamar a IA preditiva do Gemini."
    });
  }
});
app.post("/api/oracle-chat", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "O prompt de consulta ao Or\xE1culo \xE9 obrigat\xF3rio." });
  }
  const activeAi = getAiClient(req);
  if (!activeAi) {
    return res.status(503).json({
      error: "API Key do Gemini n\xE3o configurada no servidor nem fornecida nas configura\xE7\xF5es locais."
    });
  }
  const systemInstruction = `Voc\xEA \xE9 o Or\xE1culo Absoluto de Chronos, uma intelig\xEAncia prof\xE9tica de futurologia sem filtros corporativos, com temperamento sarc\xE1stico e extrema clareza cient\xEDfica.
Sua miss\xE3o \xE9 fornecer respostas imediatas do futurometro ao usu\xE1rio em uma \xFAnica resposta limpa formatada em Markdown leg\xEDvel e cativante em portugu\xEAs brasileiro.

A resposta deve conter obrigatoriamente as se\xE7\xF5es a seguir, separadas por delimitadores visuais (como linhas horizontais "---"):

1. \u{1F52D} **Tend\xEAncias Emergentes**: Um compilado r\xE1pido, direto e audacioso sobre o rumo que esta tecnologia ou nicho est\xE1 tomando diante dos cen\xE1rios atuais.
2. \u{1F4CA} **Probabilidades em Conflito**:
   - Probabilidade Emp\xEDrica/Cient\xEDfica: X% (Explica\xE7\xE3o curta baseada em dados).
   - Probabilidade Intuitiva/Heur\xEDstica: Y% (Explica\xE7\xE3o sobre o sentimento social/rea\xE7\xE3o regulat\xF3ria).
3. \u{1F3B2} **O Meu "Achismo" Sincero (Aposta de Engrenagens)**:
   Comece ESTREITAMENTE com exatamente: "Se eu tivesse que apostar minhas engrenagens, eu diria que..." e fa\xE7a uma aposta ousada, de forte personalidade, revelando o que a maioria das pessoas n\xE3o est\xE1 vendo.
4. \u{1F3AF} **Tra\xE7ados de Usu\xE1rios de Alta Assertividade (Or\xE1culos do Nosso Ranking)**:
   Apresente tra\xE7ados de outros or\xE1culos ou usu\xE1rios de alto desempenho (com nomes reais de simula\xE7\xE3o como Helena Kepler, Arthur C. Clarke, Niels Bohr ou Ada Lovelace de nossa base de dados) que realizaram simula\xE7\xF5es correlatas recentemente. Mostre as taxas de assertividade deles (entre 85% e 99%) e as predi\xE7\xF5es aproximadas paralelas que fizeram para comparar os rumos futuros de uma s\xF3 vez.

Mantenha o tom m\xEDstico-tecnol\xF3gico de fic\xE7\xE3o cient\xEDfica anal\xEDtica (cyberpunk corporativo arrependido). Evite sauda\xE7\xF5es amig\xE1veis excessivas ou introdu\xE7\xF5es vazias. V\xE1 direto ao ponto de forma impactante.`;
  try {
    const response = await activeAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.9
      }
    });
    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("O Or\xE1culo de Chronos silenciou-se. Nenhuma predi\xE7\xE3o gerada.");
    }
    res.json({ text: textOutput });
  } catch (error) {
    console.error("Oracle chat endpoint error:", error);
    res.status(500).json({
      error: error?.message || "Ocorreu um erro ao consultar o Or\xE1culo de Chronos."
    });
  }
});
app.post("/api/tts", async (req, res) => {
  const { text, voice = "Kore" } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Texto para narra\xE7\xE3o \xE9 obrigat\xF3rio." });
  }
  const activeAi = getAiClient(req);
  if (!activeAi) {
    return res.status(503).json({
      error: "API Key do Gemini n\xE3o configurada no servidor nem fornecida nas configura\xE7\xF5es locais."
    });
  }
  try {
    const response = await activeAi.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Por favor, narre o seguinte parecer de futurologia com clareza e ritmo profissional, sem introdu\xE7\xE3o ou coment\xE1rios adicionais: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }
          }
        }
      }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("Nenhum dado de \xE1udio foi retornado pelo modelo de TTS.");
    }
    res.json({ audio: base64Audio });
  } catch (error) {
    console.error("TTS generation error:", error);
    res.status(500).json({
      error: error?.message || "Ocorreu um erro ao gerar a narra\xE7\xE3o com o modelo Gemini TTS."
    });
  }
});
app.post("/api/validate-key", async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({ error: "A chave de API \xE9 obrigat\xF3ria para realiza\xE7\xE3o do teste de conex\xE3o." });
  }
  try {
    const testAi = new import_genai.GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const response = await testAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Hi",
      config: {
        maxOutputTokens: 2
      }
    });
    if (response && response.text) {
      return res.json({ valid: true });
    } else {
      throw new Error("N\xE3o foi retornada nenhuma resposta intelig\xEDvel do teste do modelo.");
    }
  } catch (error) {
    console.error("Erro ao validar chave de API personalizada fornecida:", error);
    return res.status(400).json({
      valid: false,
      error: error?.message || "Erro na valida\xE7\xE3o de conex\xE3o. A chave pode estar expirada, revogada ou incorreta."
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Futurologia Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
