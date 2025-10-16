import { Socket } from "socket.io";
import { ChatsEvents } from "./chats.events.js";


export const chatInitiation = (socket:Socket)=>{
    const chatEvents = new ChatsEvents(socket)
    chatEvents.sendPrivateMessageEvent()
    chatEvents.getConversationMessagesEvent()
    chatEvents.sendGroupMessageEvent()
    chatEvents.getGroupHistoryEvent()
}