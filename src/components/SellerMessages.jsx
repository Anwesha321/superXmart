import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPaperPlane, FaMicrophone, FaImage, 
  FaCheckDouble, FaCircle, FaUser, 
  FaPlay, FaTrash, FaMicrophoneLines 
} from 'react-icons/fa6';

export default function SellerMessages({ products, onAddToast }) {
  const [activeChatId, setActiveChatId] = useState('chat-1');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recordTimerRef = useRef(null);
  const chatEndRef = useRef(null);

  // Initial Seed Chats with Buyers
  const [chats, setChats] = useState([
    {
      id: 'chat-1',
      buyerName: 'Animesh Ghosh',
      buyerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Animesh',
      productId: 'prod-hp-laptop',
      productTitle: 'Laptop hp ProBook 15 G9',
      productPrice: '₹68,000',
      productImage: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600',
      lastMessage: 'Is Sector V a safe meeting zone for you?',
      lastTime: '10 mins ago',
      online: true,
      messages: [
        { id: 'm1', sender: 'buyer', text: 'Hi Rajesh! Is this HP Probook still available?', time: '10:15 AM' },
        { id: 'm2', sender: 'seller', text: 'Hey Animesh! Yes, it is fully available in Kolkata.', time: '10:17 AM' },
        { id: 'm3', sender: 'buyer', text: 'Great! Does it have any scratches or battery health issues?', time: '10:20 AM' },
        { id: 'm4', sender: 'seller', text: 'Zero scratches. Sparingly used, battery health is at 94% with bill and original charger.', time: '10:22 AM' },
        { id: 'm5', sender: 'buyer', text: 'Perfect. Is Sector V a safe meeting zone for you?', time: '10:25 AM' }
      ]
    },
    {
      id: 'chat-2',
      buyerName: 'Priya Sharma',
      buyerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya',
      productId: 'prod-cyber-kb',
      productTitle: 'Cyberpunk Mechanical Keyboard',
      productPrice: '₹14,500',
      productImage: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600',
      lastMessage: 'Can we close this deal for ₹13,000?',
      lastTime: '1 hr ago',
      online: false,
      messages: [
        { id: 'm1', sender: 'buyer', text: 'Hi Priya here, I am highly interested in the Cyberpunk Keyboard.', time: 'Yesterday' },
        { id: 'm2', sender: 'seller', text: 'Hi Priya! The keyboard has hot-swappable switches and keycaps.', time: 'Yesterday' },
        { id: 'm3', sender: 'buyer', text: 'Can we close this deal for ₹13,000?', time: 'Yesterday' }
      ]
    }
  ]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChatId, isTyping]);

  // Handle active timer for mockup voice recording
  useEffect(() => {
    if (isRecording) {
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(recordTimerRef.current);
      setRecordSeconds(0);
    }
    return () => clearInterval(recordTimerRef.current);
  }, [isRecording]);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const handleSendMessage = (customMsg = null) => {
    let msgObj = null;

    if (customMsg) {
      msgObj = customMsg;
    } else {
      if (!inputText.trim()) return;
      msgObj = {
        id: `msg-${Date.now()}`,
        sender: 'seller',
        text: inputText.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setInputText('');
    }

    // Append to list of messages
    const updatedChats = chats.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          lastMessage: msgObj.type === 'audio' ? '🎤 Voice message sent' : (msgObj.type === 'image' ? '🖼️ Photo shared' : msgObj.text),
          lastTime: 'Just now',
          messages: [...c.messages, msgObj]
        };
      }
      return c;
    });

    setChats(updatedChats);

    // Dynamic mockup response after 1.5 seconds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      let replyText = "Alright, that works for me. Let's arrange a secure handshake using a safe meeting zone checkpoint.";
      
      if (msgObj.type === 'audio') {
        replyText = "Perfect, I listened to your audio. Let me confirm the schedule for tomorrow evening.";
      } else if (msgObj.type === 'image') {
        replyText = "The pictures look fantastic! The quality is top tier. Let's lock this deal.";
      } else {
        const textLower = msgObj.text.toLowerCase();
        if (textLower.includes('sector v') || textLower.includes('meet') || textLower.includes('where')) {
          replyText = "Yes, Sector V police station safe zone is perfect. I can come around 5 PM tomorrow. Does that match your slot?";
        } else if (textLower.includes('price') || textLower.includes('negotiable') || textLower.includes('discount') || textLower.includes('negotiate')) {
          replyText = "I can go down to ₹66,000 max. That is an extremely fair price for the laptop specifications.";
        }
      }

      const buyerReply = {
        id: `buyer-reply-${Date.now()}`,
        sender: 'buyer',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats(prevChats => prevChats.map(c => {
        if (c.id === activeChatId) {
          return {
            ...c,
            lastMessage: buyerReply.text,
            lastTime: 'Just now',
            messages: [...c.messages, buyerReply]
          };
        }
        return c;
      }));

    }, 1800);
  };

  // Mockup Send Image Attachment
  const handleSendImage = () => {
    const mockImageMsg = {
      id: `img-${Date.now()}`,
      sender: 'seller',
      type: 'image',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=300',
      text: 'Sharing high resolution close-up of the HP box and serial key.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    handleSendMessage(mockImageMsg);
    onAddToast('🖼️ Product photo attached & sent', 'success');
  };

  // Mockup Voice Message recorder
  const toggleVoiceRecording = () => {
    if (isRecording) {
      // Finished recording, send it!
      setIsRecording(false);
      const seconds = recordSeconds || 3;
      const mockAudioMsg = {
        id: `audio-${Date.now()}`,
        sender: 'seller',
        type: 'audio',
        duration: seconds,
        text: `Voice message (${seconds}s)`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      handleSendMessage(mockAudioMsg);
      onAddToast('🎤 Voice message transmitted', 'success');
    } else {
      // Start recording
      setIsRecording(true);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex border border-white/5 bg-[#050917]/50 rounded-3xl overflow-hidden shadow-2xl">
      
      {/* 📥 Left Column: Chat Leads Inbox */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-[#040816]/70">
        <div className="p-4 border-b border-white/5">
          <h3 className="font-extrabold text-sm text-slate-200">Buyer Inquiries</h3>
          <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest">{chats.length} active leads</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {chats.map((c) => {
            const isActive = c.id === activeChatId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveChatId(c.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left cursor-pointer transition-all group ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-cyan-500/30' 
                    : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <img 
                    src={c.buyerAvatar} 
                    alt={c.buyerName} 
                    className="w-10 h-10 rounded-full border border-white/5 bg-slate-800"
                  />
                  {c.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#040816] flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-black text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                      {c.buyerName}
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold">{c.lastTime}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate leading-relaxed">{c.lastMessage}</div>
                  
                  {/* Product Tag */}
                  <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold text-slate-500 bg-slate-950/40 p-1 rounded-lg border border-white/5 w-fit">
                    <img src={c.productImage} alt="Thumb" className="w-3.5 h-3.5 rounded object-cover" />
                    <span className="truncate max-w-[120px]">{c.productTitle}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 💬 Right Column: Live Chat View */}
      <div className="flex-1 flex flex-col bg-slate-950/10 justify-between relative">
        
        {/* Chat header */}
        <div className="p-4 border-b border-white/5 bg-slate-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={activeChat.buyerAvatar} 
                alt={activeChat.buyerName} 
                className="w-10 h-10 rounded-full border border-cyan-400/20 bg-slate-800"
              />
              {activeChat.online && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900" />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                <span>{activeChat.buyerName}</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                  Buyer Lead
                </span>
              </h4>
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                {activeChat.online ? (
                  <>
                    <FaCircle className="text-[6px] text-emerald-400" />
                    <span>Active online Status</span>
                  </>
                ) : (
                  <span>Offline • Last seen 1 hr ago</span>
                )}
              </span>
            </div>
          </div>

          {/* Connected Listing Mini Panel */}
          <div className="flex items-center gap-2.5 bg-slate-950/40 border border-white/5 p-2 rounded-2xl max-w-xs">
            <img src={activeChat.productImage} alt="Product" className="w-9 h-9 rounded-lg object-cover border border-white/10" />
            <div className="min-w-0 flex-1">
              <div className="text-[9px] text-slate-500 font-black tracking-wider uppercase">Negotiation Ad</div>
              <h5 className="text-[11px] font-black text-slate-200 truncate">{activeChat.productTitle}</h5>
              <span className="text-[10px] font-extrabold text-cyan-400">{activeChat.productPrice}</span>
            </div>
          </div>
        </div>

        {/* Live Chats Logs list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Safe Escrow Warning Banner */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/15 border border-cyan-500/20 text-center max-w-md mx-auto space-y-1.5 shadow-md">
            <div className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center justify-center gap-1">
              🔒 SuperX Safe Meet Escrow Active
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Meet ONLY in the designated Safe Meeting Zones. Never release bank transfers or escrow deposits until you physically hand over the item.
            </p>
          </div>

          {activeChat.messages.map((m) => {
            const isMe = m.sender === 'seller';
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-md space-y-1.5 ${
                    isMe 
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-900/60 border border-white/5 text-slate-200 rounded-tl-none'
                  }`}
                >
                  
                  {/* Handle Image bubble */}
                  {m.type === 'image' && (
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950/40 mb-1 max-w-[200px]">
                      <img src={m.image} alt="Attachment" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Handle Voice Audio bubble */}
                  {m.type === 'audio' ? (
                    <div className="flex items-center gap-3 py-1">
                      <button className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs cursor-pointer ${
                        isMe ? 'bg-white/10 border-white/20 text-white' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                      }`}>
                        <FaPlay className="ml-0.5" />
                      </button>
                      <div className="flex-1 space-y-1">
                        {/* Fake Waveform dots */}
                        <div className="flex items-end gap-0.5 h-6">
                          <span className="w-0.5 h-3 bg-current rounded-full" />
                          <span className="w-0.5 h-5 bg-current rounded-full" />
                          <span className="w-0.5 h-4 bg-current rounded-full" />
                          <span className="w-0.5 h-2 bg-current rounded-full" />
                          <span className="w-0.5 h-4 bg-current rounded-full" />
                          <span className="w-0.5 h-6 bg-current rounded-full" />
                          <span className="w-0.5 h-3 bg-current rounded-full" />
                        </div>
                        <div className="text-[8px] opacity-70 font-semibold">🎤 Voice message ({m.duration}s)</div>
                      </div>
                    </div>
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  )}

                  {/* Checkmarks / Timestamp */}
                  <div className="flex items-center justify-end gap-1 text-[8px] opacity-60 font-semibold text-right">
                    <span>{m.time}</span>
                    {isMe && <FaCheckDouble className="text-[9px] text-cyan-200" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                <span className="text-[10px] text-cyan-400 font-semibold mr-1">{activeChat.buyerName} typing</span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Typing Bar & Multi attachments */}
        <div className="p-3 border-t border-white/5 bg-slate-950/20">
          
          {/* Active Audio Recording Bar overlay */}
          {isRecording ? (
            <div className="flex justify-between items-center p-2 rounded-2xl border border-rose-500/20 bg-rose-950/10 text-rose-400 animate-pulse">
              <div className="flex items-center gap-2 text-xs font-bold pl-2">
                <FaMicrophoneLines className="animate-spin text-sm" />
                <span>🎤 Mock Audio Recording Session: 00:{recordSeconds < 10 ? '0' + recordSeconds : recordSeconds}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsRecording(false)} 
                  className="px-3 py-1 rounded-full text-[10px] bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                >
                  Discard
                </button>
                <button 
                  onClick={toggleVoiceRecording} 
                  className="px-4 py-1 rounded-full text-[10px] font-black uppercase text-white bg-rose-500 hover:bg-rose-600 cursor-pointer shadow-lg"
                >
                  Send Rec
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Photo Attachment icon */}
              <button 
                onClick={handleSendImage}
                className="p-2.5 rounded-full border border-white/5 bg-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer"
                title="Send Photo of Product Box"
              >
                <FaImage className="text-sm" />
              </button>

              {/* Text Input Box */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Negotiate prices, confirm meetup timings..."
                className="flex-1 bg-slate-950/40 border border-white/10 rounded-full px-4.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />

              {/* Mic Icon */}
              <button 
                onClick={toggleVoiceRecording}
                className="p-2.5 rounded-full border border-white/5 bg-white/5 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer"
                title="Mock Voice Message"
              >
                <FaMicrophone className="text-sm" />
              </button>

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
                  inputText.trim()
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:scale-105 cursor-pointer shadow-lg'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
              >
                <FaPaperPlane className="text-xs" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
