
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Language, Order, Product, Employee, ShiftReport, BusinessConfig } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  data: {
    orders: Order[];
    products: Product[];
    employees: Employee[];
    shiftReports: ShiftReport[];
    business: BusinessConfig;
  };
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const AIAssistant: React.FC<Props> = ({ isOpen, onClose, language, data }) => {
  const t = TRANSLATIONS[language] as any;
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleSubmit = async (currentPrompt?: string) => {
    const userPrompt = currentPrompt || prompt;
    if (!userPrompt || isLoading) return;

    setIsLoading(true);
    setConversation(prev => [...prev, { role: 'user', text: userPrompt }]);
    setPrompt('');

    try {
      const systemInstruction = `Eres un asistente de IA para el sistema de gestión de restaurantes SUSHIMEX ENTERPRISE.
      Tu rol es ser un analista de negocios experto. Te proporcionaré datos en formato JSON sobre las operaciones del restaurante.
      Responde a las preguntas del usuario de forma concisa, profesional y directa, basándote únicamente en los datos proporcionados.
      Realiza cálculos si es necesario (ej. totales de ventas, promedios). La fecha y hora actual es ${new Date().toLocaleString()}.
      Datos: ${JSON.stringify(data)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        config: { systemInstruction },
      });
      
      const text = response.text || "No he podido procesar la solicitud.";
      setConversation(prev => [...prev, { role: 'model', text }]);

    } catch (error) {
      console.error("Error with Gemini API:", error);
      setConversation(prev => [...prev, { role: 'model', text: 'Error de conexión con el núcleo de IA.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/90 backdrop-blur-3xl p-6 animate-fade-in">
      <div className="glass-panel w-full max-w-2xl h-[80vh] rounded-[4rem] flex flex-col overflow-hidden shadow-2xl shadow-purple-500/10">
        <header className="p-8 flex justify-between items-center border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg animate-pulse">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-widest text-white">{t.ai_assistant}</h3>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Nexus Insight Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 text-zinc-400 hover:bg-red-500/20 hover:text-white transition-colors"><i className="fa-solid fa-times"></i></button>
        </header>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scroll">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200/50 dark:bg-white/5 text-slate-800 dark:text-zinc-300'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && <div className="text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">Procesando...</div>}
        </div>
        
        <div className="p-8 border-t border-white/5 bg-black/20 space-y-4">
            <div className="flex gap-2">
                <button onClick={() => handleSubmit(t.sales_today)} className="flex-1 text-xs py-2 bg-white/5 text-zinc-400 rounded-lg">{t.sales_today}</button>
                <button onClick={() => handleSubmit(t.most_profitable)} className="flex-1 text-xs py-2 bg-white/5 text-zinc-400 rounded-lg">{t.most_profitable}</button>
                <button onClick={() => handleSubmit(t.best_employee)} className="flex-1 text-xs py-2 bg-white/5 text-zinc-400 rounded-lg">{t.best_employee}</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex gap-4">
              <input 
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.ask_me}
                className="flex-1 nexus-input"
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading} className="px-6 bg-blue-600 text-white rounded-xl font-bold uppercase text-sm disabled:opacity-50">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;