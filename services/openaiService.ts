import OpenAI from 'openai';

// Initialize OpenAI Client
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

let openai: OpenAI | null = null;

if (apiKey) {
    openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage in Vite
    });
} else {
    console.warn('OpenAI API Key missing! AI features will be disabled.');
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

export const sendMessageToOpenAI = async (
    history: { role: string, parts: { text: string }[] }[],
    userMessage: string,
    customSystemInstruction?: string
): Promise<string> => {
    if (!openai) {
        console.warn('OpenAI client not initialized.');
        return "O assistente de IA não está configurado corretamente (chave de API ausente).";
    }

    try {
        // Convert Gemini history format to OpenAI messages format
        const messages: any[] = history.map(msg => ({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.parts[0]?.text || ''
        }));

        // Add system instruction at the beginning
        // For o3-mini, we use 'developer' role for system instructions if supported, or 'system'
        // Standard OpenAI API uses 'system' or 'developer' for strict instruction following models
        messages.unshift({
            role: 'system',
            content: customSystemInstruction || DEFAULT_SYSTEM_INSTRUCTION
        });

        // Add the new user message
        messages.push({
            role: 'user',
            content: userMessage
        });

        const completion = await openai.chat.completions.create({
            model: "o3-mini",
            messages: messages,
            // o3-mini specific parameters if any, usually standard chat params work
        });

        return completion.choices[0]?.message?.content || "Desculpe, não consegui gerar uma resposta.";
    } catch (error) {
        console.error("Error communicating with OpenAI:", error);
        return "Estou com dificuldade de conexão no momento. Por favor, verifique sua chave de API ou tente novamente.";
    }
};
