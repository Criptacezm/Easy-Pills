// =====================================================
// EASY PILLS - AI CHATBOT (Gemini 2.5)
// =====================================================

const GEMINI_API_KEY = 'AIzaSyDDmhraig2-rXxG3iw9rv1JwyQdPb7H0XA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Chat state
let chatHistory = [];
let isTyping = false;

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are an AI assistant for Easy Pills, a smart medication adherence system. 
You help users understand the product, its features, and answer questions about:
- How the medication dispensing system works
- Biometric authentication and security features
- Cloud integration and mobile app functionality
- Technical specifications
- The development team and project status

Be helpful, professional, and concise. If asked about topics unrelated to Easy Pills or medication adherence technology, politely redirect the conversation. 
Keep responses under 150 words unless more detail is specifically requested.`;

// Initialize chat when DOM is ready
document.addEventListener('DOMContentLoaded', initChat);

function initChat() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    if (!chatToggle || !chatWindow) return;

    // Toggle chat window
    chatToggle.addEventListener('click', () => {
        chatToggle.classList.toggle('is-open');
        chatWindow.classList.toggle('is-open');
        
        if (chatWindow.classList.contains('is-open')) {
            chatInput.focus();
            // Add welcome message if first time
            if (chatHistory.length === 0) {
                addMessage('assistant', 'Hello! 👋 I\'m the Easy Pills assistant. How can I help you learn about our smart medication adherence system today?');
            }
        }
    });

    // Handle form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = chatInput.value.trim();
        if (!message || isTyping) return;

        // Add user message
        addMessage('user', message);
        chatInput.value = '';

        // Get AI response
        await getAIResponse(message);
    });

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });

    // Handle Enter key (Shift+Enter for new line)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });
}

function addMessage(role, content) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${role}`;
    
    const iconSvg = role === 'user' 
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>';

    messageEl.innerHTML = `
        <div class="chat-message-avatar">
            ${iconSvg}
        </div>
        <div class="chat-message-content">
            ${formatMessage(content)}
        </div>
    `;

    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Store in history
    chatHistory.push({ role, content });
}

function formatMessage(content) {
    // Basic markdown-like formatting
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const typingEl = document.createElement('div');
    typingEl.className = 'chat-message assistant';
    typingEl.id = 'typing-indicator';
    typingEl.innerHTML = `
        <div class="chat-message-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
        </div>
        <div class="chat-typing">
            <div class="chat-typing-dot"></div>
            <div class="chat-typing-dot"></div>
            <div class="chat-typing-dot"></div>
        </div>
    `;

    messagesContainer.appendChild(typingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) {
        typingEl.remove();
    }
}

async function getAIResponse(userMessage) {
    const sendBtn = document.getElementById('chat-send-btn');
    
    isTyping = true;
    if (sendBtn) sendBtn.disabled = true;
    showTypingIndicator();

    try {
        // Build conversation context
        const contents = [
            {
                role: 'user',
                parts: [{ text: SYSTEM_PROMPT }]
            },
            {
                role: 'model',
                parts: [{ text: 'I understand. I will act as the Easy Pills AI assistant and help users with questions about the medication adherence system.' }]
            }
        ];

        // Add chat history (last 10 messages for context)
        const recentHistory = chatHistory.slice(-10);
        recentHistory.forEach(msg => {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        });

        // Add current message
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        hideTypingIndicator();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            addMessage('assistant', aiResponse);
        } else {
            throw new Error('Invalid response format');
        }

    } catch (error) {
        console.error('AI Chat Error:', error);
        hideTypingIndicator();
        addMessage('assistant', 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.');
    } finally {
        isTyping = false;
        if (sendBtn) sendBtn.disabled = false;
    }
}
