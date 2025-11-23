

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, GenerateContentResponse } from "@google/genai";

// Global declaration for marked (markdown parser) and katex
declare const marked: any;
declare const renderMathInElement: any;

interface ChatInterfaceProps {
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

// --- Audio Utilities for Live API ---

// Helper to encode Uint8Array to base64 string
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to decode base64 string to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Create a blob-like object expected by the SDK from Float32 PCM data
function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp and convert Float32 (-1.0 to 1.0) to Int16
    const s = Math.max(-1, Math.min(1, data[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// Decode raw PCM 16-bit audio data to AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Component ---
export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: 'Xin chào! Tôi là TRỢ LÝ AI TH ÍT ONG. Tôi có thể giúp gì cho công việc giảng dạy của bạn hôm nay?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Live Voice State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // AI is speaking (Live API)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false); // User is speaking (detected by volume)
  
  // Native TTS State
  const [autoTTS, setAutoTTS] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(false); // Native TTS is reading
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Refs for Text Chat
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for Math Rendering
  const aiRef = useRef<GoogleGenAI | null>(null);
  const chatSessionRef = useRef<any>(null);
  const autoTTSRef = useRef(false); // Mirror state for async access

  // Refs for Live API
  const liveSessionRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Refs for Transcription
  const currentInputTranscription = useRef("");
  const currentOutputTranscription = useRef("");

  useEffect(() => {
    // Initialize AI Client
    aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Initialize standard text chat session
    chatSessionRef.current = aiRef.current.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'Bạn là trợ lý giáo dục TRỢ LÝ AI TH ÍT ONG. Hãy trả lời ngắn gọn, súc tích. Nếu có công thức toán, hãy dùng LaTeX (ví dụ $$...$$).',
      }
    });

    // Load Voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };
    loadVoices();
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      stopLiveSession();
      stopTTS();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    autoTTSRef.current = autoTTS;
  }, [autoTTS]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLiveActive]); 

  // Render Math when messages update
  useEffect(() => {
    if (chatContainerRef.current && typeof renderMathInElement !== 'undefined') {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        try {
            renderMathInElement(chatContainerRef.current, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false,
                trust: true
            });
        } catch (e) {
            console.error("KaTeX render error:", e);
        }
      }, 100);
    }
  }, [messages]);

  // --- Native TTS Logic ---
  const stopTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsTTSActive(false);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
        alert("Trình duyệt của bạn không hỗ trợ đọc văn bản.");
        return;
    }

    // Ensure any running speech is cancelled before starting new one
    window.speechSynthesis.cancel();

    // Clean Markdown for reading
    const cleanText = text
      .replace(/\$\$/g, '')
      .replace(/\$/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/`{1,3}/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/!\[[^\]]*\]\([^)]+\)/g, ''); // Images

    if (!cleanText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN'; // Default fallback

    // Smart Voice Selection
    const viVoices = availableVoices.filter(v => v.lang.includes('vi'));
    // Prefer "Google Tiếng Việt" or "Microsoft HoaiMy" or similar high quality voices
    const preferredVoice = viVoices.find(v => v.name.includes('Google')) || viVoices.find(v => v.name.includes('Microsoft')) || viVoices[0];
    
    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }
    
    utterance.rate = 1.0;
    
    utterance.onstart = () => setIsTTSActive(true);
    utterance.onend = () => setIsTTSActive(false);
    utterance.onerror = () => setIsTTSActive(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // --- Text Chat Logic ---
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    stopTTS(); // Stop if reading previous

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Add placeholder for thinking
      const thinkingId = 'thinking-' + Date.now();
      setMessages(prev => [...prev, { id: thinkingId, role: 'model', text: '', isThinking: true }]);

      const result = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
      
      let fullText = "";
      
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullText += c.text;
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            if (lastMsg.isThinking) {
              lastMsg.text = fullText;
            }
            return newMsgs;
          });
        }
      }

      // Finalize message
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg.isThinking) {
           lastMsg.isThinking = false;
           lastMsg.text = fullText;
        }
        return newMsgs;
      });

      // Auto Read if enabled and NOT in Live mode (Live mode handles its own audio)
      if (autoTTSRef.current && !isLiveActive) {
          speakText(fullText);
      }

    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Xin lỗi, đã có lỗi xảy ra khi kết nối.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Live Voice Logic ---
  const startLiveSession = async () => {
    try {
      stopTTS(); // Stop native TTS if active
      setIsLiveActive(true);
      
      // 1. Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // 2. Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // 3. Connect to Live API
      const sessionPromise = aiRef.current!.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: "Bạn là TRỢ LÝ AI TH ÍT ONG, trợ lý giọng nói cho giáo viên. Bạn nói tiếng Việt giọng chuẩn, thân thiện, ngắn gọn và chuyên nghiệp.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            console.log("Live session opened");
            if (!inputAudioContextRef.current) return;
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
               const inputData = e.inputBuffer.getChannelData(0);
               let sum = 0;
               for(let i=0; i<inputData.length; i++) sum += inputData[i]*inputData[i];
               const rms = Math.sqrt(sum/inputData.length);
               setIsUserSpeaking(rms > 0.01); 

               const pcmBlob = createBlob(inputData);
               sessionPromise.then((session: any) => {
                 session.sendRealtimeInput({ media: pcmBlob });
               });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.inputTranscription?.text) {
               currentInputTranscription.current += msg.serverContent.inputTranscription.text;
            }
            if (msg.serverContent?.outputTranscription?.text) {
               currentOutputTranscription.current += msg.serverContent.outputTranscription.text;
            }
            if (msg.serverContent?.turnComplete) {
                setIsSpeaking(false);
                const userText = currentInputTranscription.current;
                const aiText = currentOutputTranscription.current;
                if (userText || aiText) {
                    setMessages(prev => {
                        const updates = [...prev];
                        if (userText.trim()) updates.push({ id: 'live-user-' + Date.now(), role: 'user', text: userText.trim() });
                        if (aiText.trim()) updates.push({ id: 'live-ai-' + Date.now(), role: 'model', text: aiText.trim() });
                        return updates;
                    });
                }
                currentInputTranscription.current = "";
                currentOutputTranscription.current = "";
            }
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
               setIsSpeaking(true);
               const ctx = outputAudioContextRef.current;
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               try {
                 const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                 const source = ctx.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(ctx.destination);
                 source.addEventListener('ended', () => {
                   audioSourcesRef.current.delete(source);
                   if (audioSourcesRef.current.size === 0) setIsSpeaking(false);
                 });
                 source.start(nextStartTimeRef.current);
                 nextStartTimeRef.current += audioBuffer.duration;
                 audioSourcesRef.current.add(source);
               } catch (e) { console.error("Audio decode error", e); }
            }
            if (msg.serverContent?.interrupted) {
               audioSourcesRef.current.forEach(s => s.stop());
               audioSourcesRef.current.clear();
               nextStartTimeRef.current = 0;
               setIsSpeaking(false);
            }
          },
          onclose: () => { setIsLiveActive(false); },
          onerror: (err) => {
            console.error("Live session error", err);
            setIsLiveActive(false);
            alert("Kết nối Voice Chat bị gián đoạn.");
          }
        }
      });
      liveSessionRef.current = sessionPromise; 
    } catch (error) {
      console.error("Failed to start live session", error);
      setIsLiveActive(false);
      alert("Không thể khởi động Voice Chat. Vui lòng kiểm tra quyền Micro.");
    }
  };

  const stopLiveSession = () => {
    if (liveSessionRef.current) {
       liveSessionRef.current.then((session: any) => { session.close(); });
       liveSessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    setIsLiveActive(false);
    setIsSpeaking(false);
    setIsUserSpeaking(false);
  };

  // Helper to render markdown safely with math protection
  const getMarkdownHtml = (markdown: string) => {
    if (!markdown) return { __html: '' };
    
    // 1. Protect Math Blocks
    const mathBlocks: string[] = [];
    let protectedText = markdown.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
      mathBlocks.push(match);
      return `___MATH_BLOCK_${mathBlocks.length - 1}___`;
    });
    protectedText = protectedText.replace(/(?:\$|\\\()([^\n]+?)(?:\$|\\\))/g, (match) => {
        mathBlocks.push(match);
        return `___MATH_INLINE_${mathBlocks.length - 1}___`;
    });
    
    // 2. Parse Markdown
    let html = "";
    if (typeof marked !== 'undefined') {
      html = marked.parse(protectedText);
    } else {
      html = protectedText;
    }

    // 3. Restore Math Blocks
    html = html.replace(/___MATH_BLOCK_(\d+)___/g, (match, id) => {
        return mathBlocks[parseInt(id)];
    });
    html = html.replace(/___MATH_INLINE_(\d+)___/g, (match, id) => {
        return mathBlocks[parseInt(id)];
    });

    return { __html: html };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in relative">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
          >
            <svg className="w-6 h-6 text-slate-600 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              Chat với TRỢ LÝ AI TH ÍT ONG
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full uppercase font-bold tracking-wider">AI</span>
            </h2>
            <p className="text-xs text-slate-500">Hỗ trợ soạn bài, tư vấn chuyên môn</p>
          </div>
        </div>

        <div className="flex items-center">
          {/* Native TTS Toggle */}
          <button
            onClick={() => setAutoTTS(!autoTTS)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all mr-3 border ${
               autoTTS 
               ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' 
               : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
            disabled={isLiveActive}
            title={isLiveActive ? "Không khả dụng trong chế độ Live" : "Tự động đọc câu trả lời"}
          >
             {autoTTS ? (
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
               </svg>
             ) : (
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
               </svg>
             )}
             <span className="hidden sm:inline">{autoTTS ? 'Đọc tự động: BẬT' : 'Đọc tự động: TẮT'}</span>
          </button>

          {/* Voice Toggle */}
          <button
            onClick={isLiveActive ? stopLiveSession : startLiveSession}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
              isLiveActive 
              ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' 
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100'
            }`}
          >
            {isLiveActive ? (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <span className="hidden sm:inline">Dừng Voice</span>
                <span className="sm:hidden">Dừng</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="hidden sm:inline">Voice Mode</span>
                <span className="sm:hidden">Voice</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 custom-scrollbar pb-32">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[90%] md:max-w-[75%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.role === 'user' 
                ? 'bg-slate-200 border-slate-300 text-slate-600' 
                : 'bg-blue-600 border-blue-600 text-white shadow-md'
              }`}>
                 {msg.role === 'user' ? (
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                   </svg>
                 ) : (
                   <span className="font-bold text-xs">E</span>
                 )}
              </div>

              {/* Bubble */}
              <div className={`relative group p-4 rounded-2xl shadow-sm ${
                msg.role === 'user'
                ? 'bg-white text-slate-800 border border-slate-200 rounded-tr-none'
                : 'bg-white text-slate-800 border border-blue-100 rounded-tl-none ring-1 ring-blue-50'
              }`}>
                {msg.role === 'model' ? (
                  <>
                    <div 
                        className="prose prose-sm prose-slate max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1"
                        dangerouslySetInnerHTML={getMarkdownHtml(msg.text)}
                    />
                    {/* TTS Button for Model Messages */}
                    <div className={`absolute -bottom-8 left-0 transition-opacity pt-1 ${isTTSActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <button 
                            onClick={() => isTTSActive ? stopTTS() : speakText(msg.text)}
                            className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold transition-colors border ${
                                isTTSActive 
                                ? 'bg-red-100 text-red-700 border-red-200' 
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-transparent'
                            }`}
                            title="Đọc nội dung"
                        >
                            {isTTSActive ? (
                              <>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                </svg>
                                Dừng đọc
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                                Đọc
                              </>
                            )}
                        </button>
                    </div>
                  </>
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                )}
                {msg.isThinking && (
                   <div className="flex gap-1 mt-2">
                     <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                     <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Voice Overlay Indicator (When Active) */}
      {isLiveActive && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-md">
            <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in-up flex flex-col items-center gap-3">
                <div className="flex items-center gap-3 w-full justify-center">
                    <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${isSpeaking ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : (isUserSpeaking ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'bg-slate-500')}`}></div>
                    <span className="font-bold text-sm tracking-wide">
                        {isSpeaking ? "TRỢ LÝ AI TH ÍT ONG đang nói..." : (isUserSpeaking ? "Đang lắng nghe bạn..." : "Chế độ rảnh tay")}
                    </span>
                </div>

                {/* Audio Visualizer Simulation */}
                <div className="flex items-center justify-center gap-1 h-8 w-full">
                    {[...Array(12)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-1.5 rounded-full transition-all duration-75 ${isSpeaking ? 'bg-green-500' : (isUserSpeaking ? 'bg-blue-500' : 'bg-slate-700')}`} 
                            style={{
                                height: (isSpeaking || isUserSpeaking) ? `${Math.max(20, Math.random() * 100)}%` : '4px',
                                opacity: (isSpeaking || isUserSpeaking) ? 1 : 0.3
                            }}
                        ></div>
                    ))}
                </div>
                <p className="text-[10px] text-slate-400 text-center">Nội dung cuộc hội thoại sẽ tự động hiện bên dưới</p>
            </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLiveActive}
            placeholder={isLiveActive ? "Đang dùng Micro (Tắt Voice để chat phím)..." : "Nhập câu hỏi của bạn ở đây..."}
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 min-h-[50px] outline-none disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-inner"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading || isLiveActive}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm mb-px hover:scale-105 active:scale-95 duration-200"
          >
            <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {!isLiveActive && (
        <div className="max-w-4xl mx-auto mt-3 flex flex-wrap gap-2">
          {[
            "Soạn giáo án bài...",
            "Tạo câu hỏi trắc nghiệm...",
            "Phân tích đề thi...",
            "Viết lời phê học bạ...",
            "Gợi ý trò chơi lớp học..."
          ].map((chip, index) => (
            <button
              key={index}
              onClick={() => setInputText(chip)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-full border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
        )}

        <p className="text-center text-[10px] text-slate-400 mt-2">
           TRỢ LÝ AI TH ÍT ONG có thể mắc lỗi. Hãy kiểm tra các thông tin quan trọng.
        </p>
      </div>
    </div>
  );
};