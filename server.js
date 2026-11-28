// server.js — a ponte entre o site e o Gemini
// [Site] --fetch--> [ESTE SERVIDOR (tem a chave)] --SDK--> [Gemini]

import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { PERSONA, CONHECIMENTO, REGRAS } from "./persona.js";

dotenv.config({ quiet: true });

<<<<<<< HEAD
// ---------- 1) Configurações ----------
=======
// 1) Configurações em que o servidor vai rodar
>>>>>>> 33a30c3968536129c2db1319135db3d5401a861c
const PORTA = 3000;

// Se der "model not found", troque só esta linha por um nome da lista:
// https://ai.google.dev/gemini-api/docs/models
<<<<<<< HEAD
const MODELOS = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-3.6-flash",
];

const ERROS_DE_FALLBACK = [404, 429, 500, 503, 504];
=======
const MODELO = "gemini-3.1-flash-lite";
>>>>>>> 33a30c3968536129c2db1319135db3d5401a861c

if (!process.env.GEMINI_API_KEY) {
  console.warn("\n⚠️  GEMINI_API_KEY não encontrada! Crie o arquivo .env com: GEMINI_API_KEY=sua_chave_aqui\n");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();

app.use(express.json());
app.use(express.static("public"));

<<<<<<< HEAD
// ---------- 2) Instrução de sistema (montada a partir do persona.js) ----------
=======
// 2) Instrução de sistema (montada a partir do persona.js) 
>>>>>>> 33a30c3968536129c2db1319135db3d5401a861c
const INSTRUCAO_DE_SISTEMA = `
Você é ${PERSONA.nome}, atendente virtual da ${PERSONA.empresa} (${PERSONA.ramo}).
Seu objetivo: ${PERSONA.objetivo}.
Seu tom: ${PERSONA.tom}

=== CONHECIMENTO DA EMPRESA ===
${CONHECIMENTO}

=== REGRAS ===
${REGRAS.map((regra, i) => `${i + 1}. ${regra}`).join("\n")}

Escreva em texto simples, sem markdown (não use **, # ou tabelas).
`;

<<<<<<< HEAD
// ---------- 3) Histórico das conversas (memória de curto prazo) ----------
=======
// 3) Histórico das conversas (memória de curto prazo) 
>>>>>>> 33a30c3968536129c2db1319135db3d5401a861c
// Fica na RAM: se o servidor desligar, as conversas somem.
const historicos = new Map();

function pegarHistorico(sessionId) {
  if (!historicos.has(sessionId)) historicos.set(sessionId, []);
  return historicos.get(sessionId);
}

<<<<<<< HEAD
// ---------- 4) Ferramenta: registrar_pedido ----------
=======
// 4) Ferramenta: registrar_pedido 
>>>>>>> 33a30c3968536129c2db1319135db3d5401a861c
// A IA não salva nada sozinha: ela PEDE a ferramenta e o NOSSO código salva.
const FERRAMENTAS = [
  {
    name: "registrar_pedido",
    description:
      "Registra um pedido de compra ou orçamento quando o cliente já informou nome, telefone e o que deseja.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        nome: { type: Type.STRING, description: "Nome do cliente." },
        telefone: { type: Type.STRING, description: "Telefone ou WhatsApp do cliente." },
        pedido: { type: Type.STRING, description: "O que o cliente quer (produto e quantidade)." },
      },
      required: ["nome", "telefone", "pedido"],
    },
<<<<<<< HEAD
    
  },
    {
    name: "listar_pedidos",
    description:
      "Lista os pedidos já registrados de um cliente. Use somente depois que o cliente informar o telefone usado no pedido.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        telefone: { type: Type.STRING, description: "Telefone usado ao registrar o pedido." },
      },
      required: ["telefone"],
    },
=======
>>>>>>> 33a30c3968536129c2db1319135db3d5401a861c
  },
];

const ARQUIVO_PEDIDOS = "pedidos.json";

<<<<<<< HEAD
function lerPedidos() {
  try {
    return JSON.parse(fs.readFileSync(ARQUIVO_PEDIDOS, "utf-8"));
  } catch (e) {
    return [];
  }
}

// Deixa só os números, para "(86) 94575-6986" e "86945756986" serem iguais.
function soDigitos(texto) {
  return String(texto || "").replace(/\D/g, "");
}

function executarFerramenta(chamada) {
  if (chamada.name === "registrar_pedido") {
    const pedidos = lerPedidos();
=======
function executarFerramenta(chamada) {
  if (chamada.name === "registrar_pedido") {
    let pedidos = [];
    try {
      pedidos = JSON.parse(fs.readFileSync(ARQUIVO_PEDIDOS, "utf-8"));
    } catch (e) {
      pedidos = [];
    }
>>>>>>> 33a30c3968536129c2db1319135db3d5401a861c

    const novo = { ...chamada.args, data: new Date().toLocaleString("pt-BR") };
    pedidos.push(novo);

    fs.writeFileSync(ARQUIVO_PEDIDOS, JSON.stringify(pedidos, null, 2));
    console.log("📥 NOVO PEDIDO:", novo);

    return { sucesso: true, numero_do_pedido: pedidos.length };
  }

<<<<<<< HEAD
  if (chamada.name === "listar_pedidos") {
    const telefone = soDigitos(chamada.args.telefone);

    const meus = lerPedidos()
      .map((p, i) => ({ numero: i + 1, pedido: p.pedido, data: p.data, telefone: p.telefone }))
      .filter((p) => soDigitos(p.telefone) === telefone)
      .map((p) => ({ numero: p.numero, pedido: p.pedido, data: p.data }));

    console.log(`🔎 Consulta de pedidos: ${meus.length} encontrado${meus.length === 1 ? "" : "s"}`);

    return { sucesso: true, quantidade: meus.length, pedidos: meus };
  }

  return { sucesso: false, aviso: `Ferramenta inexistente: ${chamada.name}` };
}

async function gerarComFallback(historico) {
  let ultimoErro;

  for (const modelo of MODELOS) {
    try {
      const resposta = await ai.models.generateContent({
        model: modelo,
        contents: historico,
        config: {
          systemInstruction: INSTRUCAO_DE_SISTEMA,
          tools: [{ functionDeclarations: FERRAMENTAS }],
        },
      });
      console.log(`Respondido por: ${modelo}`);
      return resposta;
    } catch (erro) {
      ultimoErro = erro;

      // Erro que não é de disponibilidade: não adianta trocar de modelo.
      if (!ERROS_DE_FALLBACK.includes(erro?.status)) throw erro;

      console.warn(`${modelo} indisponível, erro ${erro.status}. Tentando o próximo.`);
    }
  }

  // Todos falharam: repassa o último erro para o catch da rota.
  throw ultimoErro;
}

// ---------- 5) Rota do chat: POST /api/chat ----------
=======
  return { sucesso: false, aviso: `Ferramenta inexistente: ${chamada.name}` };
}

// 5) Rota do chat: POST /api/chat
>>>>>>> 33a30c3968536129c2db1319135db3d5401a861c
app.post("/api/chat", async (req, res) => {
  const { mensagem, sessionId } = req.body;

  if (!mensagem?.trim()) {
    return res.status(400).json({ erro: "Mensagem vazia." });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ erro: "A chave do Gemini não está configurada no .env." });
  }

  const historico = pegarHistorico(sessionId || "anonimo");
  const tamanhoAntes = historico.length;
  historico.push({ role: "user", parts: [{ text: mensagem }] });

  try {
    let textoFinal = "";

    // Até 3 voltas: pergunta → (talvez ferramenta) → resposta final.
    for (let volta = 1; volta <= 3; volta++) {
<<<<<<< HEAD
      const resposta = await gerarComFallback(historico);
=======
      const resposta = await ai.models.generateContent({
        model: MODELO,
        contents: historico,
        config: {
          systemInstruction: INSTRUCAO_DE_SISTEMA,
          tools: [{ functionDeclarations: FERRAMENTAS }],
        },
      });
>>>>>>> 33a30c3968536129c2db1319135db3d5401a861c

      const conteudo = resposta.candidates?.[0]?.content;
      if (conteudo) historico.push(conteudo);

      const chamadas = resposta.functionCalls;
      if (!chamadas || chamadas.length === 0) {
        textoFinal = resposta.text ?? "";
        break;
      }

      const resultados = chamadas.map((chamada) => ({
        functionResponse: {
          id: chamada.id,
          name: chamada.name,
          response: executarFerramenta(chamada),
        },
      }));
      historico.push({ role: "user", parts: resultados });
    }

    return res.json({
      resposta: textoFinal || "Desculpe, não consegui responder agora. Pode repetir?",
    });
  } catch (erro) {
    console.error("❌ Erro ao falar com o Gemini:", erro);
    historico.length = tamanhoAntes;
    return res.status(500).json({ erro: erro?.message || "Falha ao falar com o Gemini." });
  }
});

<<<<<<< HEAD
// ---------- 6) Ligar o servidor ----------
=======
// 6) Ligar o servidor
>>>>>>> 33a30c3968536129c2db1319135db3d5401a861c
app.listen(PORTA, () => {
  console.log(`✅ ${PERSONA.empresa} no ar: http://localhost:${PORTA}`);
  console.log(`🤖 Atendente virtual: ${PERSONA.nome}`);
});
