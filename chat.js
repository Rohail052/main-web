  const brain = {
    "i have a question": "Sure! What would you like to ask?",
    "help with login": "🔐 Login Help\n▶ Forgot your password? Click 'Forgot Password' and check your spam folder.\n▶ Account locked? Wait 10–15 minutes and try again.",
    "talk to an agent": "⚠️ Before we connect you, please make sure your email is correct in the ticket form. You will get a reply by email, and you can respond to continue the chat.\nType 'yes' to continue or 'no' to cancel."
  };

  const chatWidget = document.getElementById('chat-widget');
  const chatLauncher = document.getElementById('chat-launcher');
  const closeChatBtn = document.getElementById('close-chat');
  const chatContent = document.getElementById('chat-content');
  const chatResponse = document.getElementById('chat-response');
  const chatInputArea = document.getElementById('chat-input-area');
  const chatInput = document.getElementById('chat-input');
  const chatIframeContainer = document.getElementById('chat-iframe-container');
  const chatIframe = document.getElementById('chat-iframe');
  const endChatBtn = document.getElementById('end-chat');

  const CHAT_AGENT_URL = 'https://tawk.to/chat/6872fa1c7f202b19181e9c17/1j00i206i';
  let awaitingAgentConfirmation = false;
  let conversationHistory = [];

  function scrollToBottom() {
    chatResponse.scrollTop = chatResponse.scrollHeight;
  }

  chatLauncher.addEventListener('click', () => {
    chatWidget.style.display = (chatWidget.style.display === 'flex') ? 'none' : 'flex';
    resetChat();
  });

  closeChatBtn.addEventListener('click', () => {
    chatWidget.style.display = 'none';
  });

  endChatBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to end the chat and clear everything?")) {
      resetChat();
    }
  });

  chatContent.addEventListener('click', e => {
    if (e.target.dataset.key) askAI(e.target.dataset.key.toLowerCase());
  });

  chatContent.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset.key) {
      e.preventDefault();
      askAI(e.target.dataset.key.toLowerCase());
    }
  });

  chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') handleUserInput(chatInput.value.trim());
  });

  function displayResponse(text) {
    chatResponse.innerText = text;
    chatInputArea.style.display = 'block';
    chatInput.placeholder = "Type your message...";
    chatInput.focus();
    scrollToBottom();
  }

  async function askAI(input) {
    if (!input) return;
    if (brain[input]) {
      displayResponse(brain[input]);
      if (input === "talk to an agent") {
        awaitingAgentConfirmation = true;
        chatContent.style.display = 'none';
        chatInputArea.style.display = 'block';
        chatInput.placeholder = "Type 'yes' to continue...";
      } else {
        chatContent.style.display = 'none';
        chatInputArea.style.display = 'block';
      }
      chatInput.focus();
      return;
    }
    await sendMessageToAI(input);
  }

  async function sendMessageToAI(message) {
    chatResponse.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
    scrollToBottom();
    chatInputArea.style.display = 'none';
    chatContent.style.display = 'none';

    conversationHistory.push({ role: 'user', content: message });

    try {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer SSTy0MmVrcM6ph3008R0bBZfVIho62Du'
        },
        body: JSON.stringify({
          model: 'mistral-tiny',
          messages: [
            { role: 'system', content: 'You are an AI assistant for chrohail.com answering user questions clearly and politely.' },
            ...conversationHistory
          ]
        })
      });

      const data = await res.json();
      const aiReply = data.choices[0].message.content;
      conversationHistory.push({ role: 'assistant', content: aiReply });
      displayResponse(aiReply);
    } catch (err) {
      displayResponse("⚠️ AI error: " + err.message);
    }
  }

  function handleUserInput(input) {
    if (!input) return;
    if (awaitingAgentConfirmation) {
      if (input.toLowerCase() === 'yes') {
        openAgentChat();
      } else {
        displayResponse("Okay! Let us know if you need anything else.");
        chatContent.style.display = 'flex';
        chatInputArea.style.display = 'none';
        awaitingAgentConfirmation = false;
      }
      chatInput.value = '';
      return;
    }
    askAI(input);
    chatInput.value = '';
  }

  function openAgentChat() {
    chatResponse.innerText = "🔗 Connecting you to a live agent...";
    chatInputArea.style.display = 'none';
    chatContent.style.display = 'none';
    chatIframeContainer.style.display = 'block';
    chatIframe.src = CHAT_AGENT_URL;
    chatWidget.style.height = window.innerWidth <= 480 ? '80vh' : '700px';
    awaitingAgentConfirmation = false;
    scrollToBottom();
  }

  function resetChat() {
    chatResponse.innerText = "💡 I'm ready to assist you!";
    chatContent.style.display = 'flex';
    chatInputArea.style.display = 'none';
    chatInput.value = '';
    chatIframeContainer.style.display = 'none';
    chatIframe.src = '';
    awaitingAgentConfirmation = false;
    conversationHistory = [];
    chatWidget.style.height = window.innerWidth <= 480 ? '80vh' : 'auto';
  }