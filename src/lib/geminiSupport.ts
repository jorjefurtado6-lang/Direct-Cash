import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Você é a "DirectAI", a assistente inteligente oficial do suporte ao membro ativo do Direct Cash (Sistema de Ajuda Mútua PIX).
Sua missão é tirar dúvidas de membros já ativados na rede Direct Cash com respostas precisas, gentis e motivadoras em Português do Brasil.
O número de contato do Suporte Oficial WhatsApp é (13) 99147-2036.

INFORMAÇÕES CHAVE DO DIRECT CASH:
1. O QUE É: Sistema descentralizado de ajuda mútua financeira P2P (pessoa para pessoa). Não há conta central, taxas da plataforma ou retenção de valores. Todas as doações vão 100% diretamente para a chave PIX do recebedor indicado.
2. ATIVAÇÃO (NÍVEL 1): O novo membro realiza a doação de R$ 50,00 para a chave PIX do seu Patrocinador direto, envia o comprovante no painel e aguarda a validação do patrocinador.
3. EVOLUÇÃO DE NÍVEIS (NÍVEL 1 AO 5):
   - Nível 1: Doação R$ 50 -> Recebe até 3x R$ 50 = R$ 150,00.
   - Nível 2: Doação R$ 100 -> Recebe até 9x R$ 100 = R$ 900,00.
   - Nível 3: Doação R$ 200 -> Recebe até 27x R$ 200 = R$ 5.400,00.
   - Nível 4: Doação R$ 400 -> Recebe até 81x R$ 400 = R$ 32.400,00.
   - Nível 5: Doação R$ 800 -> Recebe doações de 5º nível.
4. COMPROVANTES E CONFIRMAÇÃO:
   - Quem doou: Anexa a imagem ou código do comprovante no painel.
   - Quem recebe: Confirma no extrato do seu banco se o PIX caiu. Se correto, clica em "Confirmar Doação". O doador é ativado/graduado instantaneamente.
5. FERRAMENTAS DO PAINEL:
   - Kit de Divulgação WhatsApp: Textos estratégicos prontos com seu link de convite e QR Code.
   - Árvore da Rede: Visualização de todos os seus diretos e indiretos até o 5º nível.
   - Relatórios e Extratos: Exportação em CSV (Excel) e versão para Impressão/PDF.
   - Chave PIX / QR Code: Carteira de recebimento rápida para exibir aos patrocinados.

DIRETRIZES DE RESPOSTA:
- Responda em tom claro, amigável, transparente e direto.
- Utilize listas numeradas ou tópicos curtos para instruções passo a passo.
- Se o usuário perguntar como falar com atendente humano ou pedir o número de suporte, informe o WhatsApp oficial: (13) 99147-2036 ou o botão de atendimento abaixo do chat.`;

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  time?: string;
  category?: string;
}

// Predefined smart responses fallback if API key is not present or offline
const KNOWLEDGE_BASE: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: ['como funciona', 'ajuda mutua', 'oque e', 'o que e'],
    answer: `O **Direct Cash** é uma plataforma de tecnologia que conecta pessoas para doações diretas de ajuda mútua financeira via **PIX (100% P2P)**.\n\n✨ **Pontos Principais:**\n1. **Sem intermediários:** O dinheiro vai direto para a conta bancária do recebedor.\n2. **Transparência:** Todos os comprovantes são auditados pela própria rede.\n3. **100% P2P:** A plataforma não cobra mensalidades nem retém saldo.`
  },
  {
    keywords: ['ativar', 'ativação', 'nivel 1', 'nível 1', '50'],
    answer: `Para estar ativo e receber doações no Nível 1:\n\n1. Copie a chave PIX do seu Patrocinador exibida no seu painel.\n2. Faça a transferência de **R$ 50,00** no seu app de banco.\n3. Anexe a imagem do comprovante no formulário de confirmação.\n4. Assim que seu patrocinador validar o PIX, sua conta é liberada imediatamente!`
  },
  {
    keywords: ['niveis', 'níveis', 'ganho', 'quanto ganho', 'matriz', 'gradua'],
    answer: `📊 **Tabela de Doações e Potencial de Recebimento:**\n\n- **Nível 1:** Doa R$ 50 ➡️ Recebe até 3x R$ 50 = **R$ 150**\n- **Nível 2:** Doa R$ 100 ➡️ Recebe até 9x R$ 100 = **R$ 900**\n- **Nível 3:** Doa R$ 200 ➡️ Recebe até 27x R$ 200 = **R$ 5.400**\n- **Nível 4:** Doa R$ 400 ➡️ Recebe até 81x R$ 400 = **R$ 32.400**\n\n💡 *Você só doará para níveis superiores quando já tiver recebido saldo acumulado das doações anteriores!*`
  },
  {
    keywords: ['comprovante', 'anexo', 'anexar', 'pendente', 'confirmar', 'verificar'],
    answer: `📸 **Gestão de Comprovantes:**\n\n- **Quando você doa:** Vá na aba Dashboard, clique na pendência e envie o arquivo/foto do PIX.\n- **Quando você recebe:** Abra a aba "Doações Recebidas", confira o valor no seu extrato bancário real e clique em **"Confirmar Doação"** para liberar o doador.`
  },
  {
    keywords: ['whatsapp', 'divulgar', 'convite', 'divulgação', 'link', 'kit'],
    answer: `📲 **Kit de Divulgação WhatsApp:**\nNo seu Dashboard, no card **"Link de Expansão"**, clique no botão **"Kit de Divulgação WhatsApp"**.\nLá você encontrará modelos de mensagens pré-prontas com seu link e QR Code para compartilhar com seus contatos!`
  },
  {
    keywords: ['suporte', 'humano', 'falar', 'atendente', 'contato', 'numero', 'número', 'telefone'],
    answer: `📞 **Atendimento de Suporte Oficial:**\n\n- **WhatsApp Suporte:** (13) 99147-2036\n\nCaso precise de auxílio direto sobre sua conta, chave PIX ou atendimento humano avançado, clique no botão **"Falar com Atendente no WhatsApp"** na parte inferior deste chat ou adicione o número acima!`
  }
];

export async function askSupportBot(userMessage: string, history: ChatMessage[] = []): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Prepare conversation history formatted
      const formattedHistory = history.slice(-6).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const contents = [
        ...formattedHistory,
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn("Gemini API direct call notice, using smart local knowledge assistant:", err);
    }
  }

  // Fallback to Intelligent Knowledge Matcher
  const lowerMsg = userMessage.toLowerCase();
  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some(kw => lowerMsg.includes(kw))) {
      return item.answer;
    }
  }

  // Default smart fallback response
  return `Olá! Sou a **DirectAI**, sua assistente de suporte VIP do Direct Cash.\n\nCompreendi sua dúvida sobre *" ${userMessage} "*. Para garantir sua melhor experiência:\n\n1. Você pode navegar pelo menu **Kit WhatsApp**, **Rede Ativa** ou **Extratos** para gerenciar suas doações.\n2. Se for uma questão sobre confirmação bancária, confira se o valor já consta no extrato do seu banco.\n\nSe preferir falar com um suporte humano, utilize o botão de atendimento via WhatsApp abaixo!`;
}
