const chatWidget = document.getElementById('chat-widget');
const chatLauncher = document.getElementById('chat-launcher');
const closeChatBtn = document.getElementById('close-chat');
const chatContent = document.getElementById('chat-content');
const chatResponse = document.getElementById('chat-response');
const chatInputArea = document.getElementById('chat-input-area');
const chatInput = document.getElementById('chat-input');
const chatIframeContainer = document.getElementById('chat-iframe-container');
const chatIframe = document.getElementById('chat-iframe');

const CHAT_AGENT_URL = 'https://tawk.to/chat/6872fa1c7f202b19181e9c17/1j00i206i';

const brain = {
  "i have a question": "Sure! What would you like to ask?",
  "help with login": "🔐 Login Help\n▶ Forgot your password?\nClick 'Forgot Password' and check your spam folder.\n▶ Account locked?\nWait 10–15 minutes and try again.",
  "file issue": "📁 File Help\n▶ File not showing? Refresh the page.\n▶ Deleted something? Click the trash icon next to the file.",
  "talk to an agent": "⚠️ Before we connect you, please make sure your email is correct in the ticket form. You will get a reply by email, and you can respond to continue the chat.\n\nType 'yes' to continue or 'no' to go back."
};

let awaitingAgentConfirmation = false;

chatLauncher.addEventListener('click', () => {
  chatWidget.style.display = chatWidget.style.display === 'flex' ? 'none' : 'flex';
  chatWidget.style.flexDirection = 'column';
  resetChat();
});

closeChatBtn.addEventListener('click', () => {
  chatWidget.style.display = 'none';
  resetChat();
});

function resetChat() {
  chatResponse.innerText = "💡 I'm ready to assist you!";
  chatContent.style.display = 'block';
  chatInputArea.style.display = 'none';
  chatInput.value = '';
  chatIframeContainer.style.display = 'none';
  chatIframe.src = '';
  awaitingAgentConfirmation = false;
  chatWidget.style.height = window.innerWidth <= 480 ? '100vh' : 'auto';
}

function askAI(input) {
  const key = input.toLowerCase().trim();
  const reply = brain[key];

  if (reply) {
    chatResponse.innerText = reply;

    if (key === "talk to an agent") {
      awaitingAgentConfirmation = true;
      chatContent.style.display = 'none';
      chatInputArea.style.display = 'block';
      chatInput.placeholder = "Type 'yes' to continue...";
      chatInput.focus();
      return;
    }

    chatContent.style.display = 'none';
    chatInputArea.style.display = 'block';
    chatInput.placeholder = "Type your question...";
    chatInput.focus();
  } else {
    chatResponse.innerText = brain["talk to an agent"];
    awaitingAgentConfirmation = true;
    chatContent.style.display = 'none';
    chatInputArea.style.display = 'block';
    chatInput.placeholder = "Type 'yes' to continue...";
    chatInput.focus();
  }
}

function handleKey(e) {
  if (e.key === 'Enter') {
    const userInput = chatInput.value.trim().toLowerCase();
    if (!userInput) return;

    if (awaitingAgentConfirmation) {
      if (userInput === 'yes') {
        openAgentChat();
      } else {
        chatResponse.innerText = "Okay! Let us know if you need anything else.";
        chatInputArea.style.display = 'none';
        chatContent.style.display = 'block';
        awaitingAgentConfirmation = false;
      }
      chatInput.value = '';
      return;
    }

    askAI(userInput);
    chatInput.value = '';
  }
}

function openAgentChat() {
  chatContent.style.display = 'none';
  chatInputArea.style.display = 'none';
  chatIframeContainer.style.display = 'block';
  chatResponse.innerText = "🔗 Connecting you to a live agent...";
  chatWidget.style.height = window.innerWidth <= 480 ? '100vh' : '700px';
  chatIframe.src = CHAT_AGENT_URL;
}
