
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface InputAreaProps {
  onGenerate: (text: string) => Promise<void>;
  isGenerating: boolean;
  lang: Language;
}

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isGenerating, lang }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = translations[lang];

  const handleSubmit = () => {
    if (!input.trim() || isGenerating) return;
    onGenerate(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  return (
    <div className="w-full max-w-3xl mx-auto mb-10">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white rounded-xl shadow-xl flex flex-col border border-gray-100">
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.input_placeholder}
            className="w-full p-4 md:p-6 bg-transparent rounded-t-xl focus:outline-none text-gray-900 text-lg resize-none min-h-[120px] placeholder-gray-400"
            disabled={isGenerating}
          />
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-b-xl border-t border-gray-100">
             <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 max-w-[70%]">
               {/* Quick Prompt Chips */}
               {input.length === 0 && t.suggested_prompts.slice(0, 2).map((prompt, idx) => (
                 <button 
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="whitespace-nowrap px-3 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-colors shadow-sm"
                 >
                   {prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt}
                 </button>
               ))}
             </div>

             <button
              onClick={handleSubmit}
              disabled={!input.trim() || isGenerating}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-300
                ${!input.trim() || isGenerating 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-0.5'
                }`}
             >
               {isGenerating ? (
                 <>
                   <Loader2 size={18} className="animate-spin" />
                   <span>{t.processing}</span>
                 </>
               ) : (
                 <>
                   <Sparkles size={18} />
                   <span>{t.create}</span>
                 </>
               )}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
