import { randomId } from "@mantine/hooks";
import { Conversation, Message } from "..";
import { atom } from "recoil";

const activeConvoState = atom({
  key: "active-convo-id",
  default: getActiveConversation().id,
});

export {
  activeConvoState,
};

export function getConversations(): Conversation[] {
  const conversations = localStorage.getItem("conversations");
  if (conversations) {
    return JSON.parse(conversations);
  }
  return [];
}

export function setConversations(conversations: Conversation[]) {
  localStorage.setItem("conversations", JSON.stringify(conversations));
}

function getActiveConversation(): Conversation {
  const convoId = localStorage.getItem("conversation-active");
  const conversations = getConversations();
  if (convoId) {
    const convo = conversations.find((conv) => conv.id === convoId);
    if(convo) {
      return convo;
    }
  }

  if (conversations.length > 0) {
    return conversations[0];
  } else {
    setConversations([
      {
        id: randomId(),
        name: "New Convo",
      },
    ]);
    const convo = getConversations()[0];
    setActiveConversation(convo.id);
    return convo;
  }
}

export function setActiveConversation(convId: string) {
  localStorage.setItem("conversation-active", convId);
}

export function getMessages(convoId: string): Message[] {
  const messages = localStorage.getItem("messages-"+convoId);
  if (messages) {
    return JSON.parse(messages);
  }
  return [];
}

export function setMessages(convoId: string, messages: Message[]) {
  localStorage.setItem("messages-"+convoId, JSON.stringify(messages));
}

export function deleteMessage(convoId: string, msgId: string) {
  const messages = getMessages(convoId);
  const newMessages = messages.filter((msg) => msg.id !== msgId);
  setMessages(convoId, newMessages);
}


export function getInputSource(convoId: string): 'YOU' | 'THEM' {
  const inputSource = localStorage.getItem("input-source-"+convoId);
  if (inputSource) {
    return inputSource as 'YOU' | 'THEM';
  }
  return 'YOU';
}

export function setInputSource(convoId: string, inputSource: 'YOU' | 'THEM') {
  localStorage.setItem("input-source-"+convoId, inputSource);
}

