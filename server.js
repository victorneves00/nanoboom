// server.js — a ponte entre o site e o Gemini
// [Site] --fetch--> [ESTE SERVIDOR (tem a chave)] --SDK--> [Gemini]

import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { PERSONA, CONHECIMENTO, REGRAS } from "./persona.js";

dotenv.config({ quiet: true });

// 1) Configurações em que o servidor vai rodar
const PORTA = 3000;

// Se der "model not found", troque só esta linha por um nome da lista:
// https://ai.google.dev/gemini-api/docs/models
const MODELO = "gemini-3.1-flash-lite";

if (!process.env.GEMINI_API_KEY) {
  console.warn("\n⚠️  GEMINI_API_KEY não encontrada! Crie o arquivo .env com: GEMINI_API_KEY=sua_chave_aqui\n");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();

app.use(express.json());
app.use(express.static("public"));

// 2) Instrução de sistema (montada a partir do persona.js) 
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

// 3) Histórico das conversas (memória de curto prazo) 
// Fica na RAM: se o servidor desligar, as conversas somem.
const historicos = new Map();

function pegarHistorico(sessionId) {
  if (!historicos.has(sessionId)) historicos.set(sessionId, []);
  return historicos.get(sessionId);
}

// 4) Ferramenta: registrar_pedido 
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
  },
];

const ARQUIVO_PEDIDOS = "pedidos.json";

function executarFerramenta(chamada) {
  if (chamada.name === "registrar_pedido") {
    let pedidos = [];
    try {
      pedidos = JSON.parse(fs.readFileSync(ARQUIVO_PEDIDOS, "utf-8"));
    } catch (e) {
      pedidos = [];
    }

    const novo = { ...chamada.args, data: new Date().toLocaleString("pt-BR") };
    pedidos.push(novo);

    fs.writeFileSync(ARQUIVO_PEDIDOS, JSON.stringify(pedidos, null, 2));
    console.log("📥 NOVO PEDIDO:", novo);

    return { sucesso: true, numero_do_pedido: pedidos.length };
  }

  return { sucesso: false, aviso: `Ferramenta inexistente: ${chamada.name}` };
}

// 5) Rota do chat: POST /api/chat
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
      const resposta = await ai.models.generateContent({
        model: MODELO,
        contents: historico,
        config: {
          systemInstruction: INSTRUCAO_DE_SISTEMA,
          tools: [{ functionDeclarations: FERRAMENTAS }],
        },
      });

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

// 6) Ligar o servidor
app.listen(PORTA, () => {
  console.log(`✅ ${PERSONA.empresa} no ar: http://localhost:${PORTA}`);
  console.log(`🤖 Atendente virtual: ${PERSONA.nome}`);
});
