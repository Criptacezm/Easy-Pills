/* ============================================
   Easy Pills - Gemini AI Chatbot Integration
   Minimalist Design with Pill Loading Animation
   ============================================ */

// 1. API Configuration
const GEMINI_API_URL = "/api/chat.js"; // Point to your Vercel function

// 2. System Instruction for Easy Pills AI
const SYSTEM_INSTRUCTION = `You are an AI assistant for Easy Pills, a smart medication adherence system. 
You help users understand the product, its features, and answer questions about:
- How the medication dispensing system works
- Biometric authentication and security features
- Cloud integration and mobile app functionality
- Technical specifications
- The development team and project status

RESPONSE RULES:
- Keep responses under 150 words unless specifically asked for detail
- Get straight to the point - no filler phrases
- Use bullet points (•) for lists - max 5 items
- For code: wrap in triple backticks with language name
- Use **bold** sparingly for key terms only
- One paragraph max for explanations unless complex
- Never apologize or use filler language
- If asked about topics unrelated to Easy Pills or medication adherence technology, politely redirect the conversation

Be helpful, professional, precise, and brief.`;

// Chat state
let chatHistory = [];
let isTyping = false;

/**
 * Core API Call to Gemini using REST API
 */
async function callGeminiAPI(userPrompt) {
    try {
        const contents = [];
        
        chatHistory.slice(-6).forEach(msg => {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        });

        contents.push({
            role: "user",
            parts: [{ text: `INSTRUCTION: ${SYSTEM_INSTRUCTION}\n\nUSER QUESTION: ${userPrompt}` }]
        });
        
        const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userPrompt,
                    history: contents, // Your formatted history
                    instruction: SYSTEM_INSTRUCTION
                })
            });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error details:', errorData);
            
            if (response.status === 429) {
                return "⚠️ Rate limit reached. Please wait a moment.";
            }
            if (response.status === 400) {
                return "⚠️ API Request Error. Please check if your API key is restricted or if the prompt is too long.";
            }
            throw new Error(errorData.error?.message || 'API request failed');
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }
        
        return "I'm sorry, I couldn't generate a response. Please try rephrasing.";
    } catch (error) {
        console.error('Gemini API Fetch Error:', error);
        return `Connection error. Please check your internet or API key.`;
    }
}

/**
 * Escape HTML for safe rendering
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format AI response with HTML for professional display
 */
function formatAIResponse(text) {
    let html = text;
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'plaintext';
        return `<div class="ai-code-container">
            <div class="ai-code-toolbar"><span class="ai-code-language">${language}</span></div>
            <pre class="ai-code-pre"><code class="ai-code">${escapeHtml(code.trim())}</code></pre>
        </div>`;
    });
    
    html = html.replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^[•\-\*]\s+(.+)$/gm, '<li class="ai-list-item">$1</li>');
    html = html.replace(/(<li class="ai-list-item">.*<\/li>\n?)+/g, '<ul class="ai-list">$&</ul>');
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

// Initialize chat when DOM is ready
document.addEventListener('DOMContentLoaded', initChat);

function initChat() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatSidebar = document.getElementById('chat-sidebar');
    const chatOverlay = document.getElementById('chat-overlay');
    const chatClose = document.getElementById('chat-close');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatToggle || !chatSidebar || !chatForm) return;

    // Re-initialize Lucide icons for chat
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Open chat sidebar
    function openChat() {
        chatToggle.classList.add('is-open');
        chatSidebar.classList.add('is-open');
        chatOverlay.classList.add('is-open');
        
        // Stop Lenis smooth scroll when chat is open
        if (typeof lenis !== 'undefined') {
            lenis.stop();
        }
        
        chatInput.focus();
        
        if (chatHistory.length === 0) {
            addMessage('assistant', 'Hello! 👋 I\'m the Easy Pills assistant. How can I help you learn about our smart medication adherence system today?');
        }
    }

    // Close chat sidebar
    function closeChat() {
        chatToggle.classList.remove('is-open');
        chatSidebar.classList.remove('is-open');
        chatOverlay.classList.remove('is-open');
        
        // Resume Lenis smooth scroll
        if (typeof lenis !== 'undefined') {
            lenis.start();
        }
    }

    chatToggle.addEventListener('click', () => {
        if (chatSidebar.classList.contains('is-open')) {
            closeChat();
        } else {
            openChat();
        }
    });

    chatClose.addEventListener('click', closeChat);
    chatOverlay.addEventListener('click', closeChat);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatSidebar.classList.contains('is-open')) {
            closeChat();
        }
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message || isTyping) return;

        addMessage('user', message);
        chatInput.value = '';
        chatInput.style.height = 'auto';

        await getAIResponse(message);
    });

    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Prevent wheel events from bubbling out of chat messages
    if (chatMessages) {
        chatMessages.addEventListener('wheel', (e) => {
            const { scrollTop, scrollHeight, clientHeight } = chatMessages;
            const isAtTop = scrollTop === 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight;
            
            if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
                e.preventDefault();
            }
            e.stopPropagation();
        }, { passive: false });

        // Touch scroll handling
        let touchStartY = 0;
        chatMessages.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        chatMessages.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const { scrollTop, scrollHeight, clientHeight } = chatMessages;
            const isAtTop = scrollTop === 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight;
            const isScrollingUp = touchY > touchStartY;
            const isScrollingDown = touchY < touchStartY;
            
            if ((isScrollingUp && isAtTop) || (isScrollingDown && isAtBottom)) {
                e.preventDefault();
            }
            e.stopPropagation();
        }, { passive: false });
    }
}

function addMessage(role, content) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${role}`;
    
    messageEl.innerHTML = `
        <div class="chat-message-bubble">
            <div class="chat-message-content">
                ${role === 'assistant' ? formatAIResponse(content) : escapeHtml(content)}
            </div>
            <div class="chat-message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    `;

    messagesContainer.appendChild(messageEl);
    
    requestAnimationFrame(() => {
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    });
    
    chatHistory.push({ role, content });
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const typingEl = document.createElement('div');
    typingEl.className = 'chat-message assistant';
    typingEl.id = 'typing-indicator';
    typingEl.innerHTML = `
        <div class="chat-message-bubble">
            <div class="chat-typing-pill">
                <div class="typing-pill-icon">💊</div>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingEl);
    
    requestAnimationFrame(() => {
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    });
}

function hideTypingIndicator() {
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) typingEl.remove();
}

async function getAIResponse(userMessage) {
    const sendBtn = document.getElementById('chat-send-btn');
    isTyping = true;
    if (sendBtn) sendBtn.disabled = true;
    showTypingIndicator();

    try {
        const response = await callGeminiAPI(userMessage);
        hideTypingIndicator();
        addMessage('assistant', response);
    } catch (error) {
        hideTypingIndicator();
        addMessage('assistant', 'Sorry, I encountered an error. Please check your console.');
    } finally {
        isTyping = false;
        if (sendBtn) sendBtn.disabled = false;
    }
}
