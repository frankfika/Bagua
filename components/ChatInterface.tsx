import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithMaster } from '../services/geminiService';

const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: '贫道已阅您的命盘。若有具体疑惑，如流年运势、事业决断或情感纠葛，请直言。' }
    ]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;

        const userText = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsSending(true);

        try {
            const response = await chatWithMaster(userText);
            setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: '天机混沌，暂无法回答。请稍后再试。' }]);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[400px] sm:h-[500px] bg-stone-50 rounded-lg border border-stone-200 overflow-hidden shadow-sm">
            <div className="bg-stone-800 p-3 text-center border-b border-amber-600 shadow-md z-10 shrink-0">
                <h3 className="text-gold font-serif font-bold tracking-widest text-sm flex items-center justify-center gap-2">
                    <span>◈</span>
                    大师解惑
                    <span>◈</span>
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-100/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-lg p-3 text-sm font-serif leading-relaxed shadow-sm
                            ${msg.role === 'user' 
                                ? 'bg-white text-stone-800 border border-stone-200 rounded-tr-none' 
                                : 'bg-stone-200 text-stone-900 border border-stone-300 rounded-tl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isSending && (
                    <div className="flex justify-start">
                        <div className="bg-stone-100 text-stone-400 rounded-lg p-3 text-xs font-serif italic flex items-center gap-2">
                             <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-75"></div>
                             <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-200 flex gap-2 shrink-0">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="输入您的问题..."
                    className="flex-1 bg-stone-50 border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 font-serif transition-colors"
                />
                <button 
                    type="submit" 
                    disabled={isSending}
                    className="bg-stone-800 text-gold px-4 py-2 rounded text-sm font-serif font-bold hover:bg-black transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm active:scale-95 transform"
                >
                    发送
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;