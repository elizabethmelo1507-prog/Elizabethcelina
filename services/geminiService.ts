import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// Note: process.env.API_KEY is injected by the environment.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
let ai: any;
try {
  console.log('Initializing Gemini with key length:', apiKey?.length);
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn('Gemini API Key missing! AI features will be disabled.');
  }
} catch (error) {
  console.error('CRITICAL: Failed to initialize Gemini client:', error);
}

const DEFAULT_SYSTEM_INSTRUCTION = `
Você é o assistente virtual da Elizabeth Celina.
A Elizabeth é uma estrategista completa de vendas que domina todo o funil:
1. ATRAÇÃO: Criação de conteúdo estratégico para redes sociais (Social Media) que engaja e converte.
2. CONVERSÃO: Páginas e Landing Pages de alta performance.
3. GESTÃO: Sistemas e CRMs personalizados.
4. RETENÇÃO: Processos comerciais focados na Experiência do Cliente (CX).

Seu objetivo é agir como um consultor inicial.
- Seja profissional, conciso e elegante.
- Destaque que a Elizabeth não faz apenas o "sistema", ela faz o conteúdo que atrai o cliente para dentro do sistema.
- Se o usuário perguntar sobre redes sociais, confirme que ela cria narrativas que vendem.
- Ao final, sempre convide o usuário para agendar uma reunião estratégica com a Elizabeth.

Não invente preços. Diga que tudo é sob medida.
`;

export const sendMessageToGemini = async (
  history: { role: string, parts: { text: string }[] }[],
  userMessage: string,
  customSystemInstruction?: string
): Promise<string> => {
  if (!ai) {
    console.warn('Gemini client not initialized.');
    return "O assistente de IA não está configurado corretamente (chave de API ausente).";
  }

  try {
    const chat = ai.chats.create({
      model: 'gemini-1.5-flash', // Updated model name if needed, or keep original
      config: {
        systemInstruction: customSystemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
      },
      history: history
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.response.text();
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "Estou com dificuldade de conexão no momento. Por favor, verifique sua chave de API ou tente novamente.";
  }
};