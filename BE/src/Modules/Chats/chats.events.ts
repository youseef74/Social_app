import { Socket } from "socket.io";
import { ChatService } from './Services/chat.services.js';


export class ChatsEvents{
    private chatServices:ChatService = new ChatService()
    constructor(private socket:Socket){}

    sendPrivateMessageEvent(){
        this.socket.on('send-private-message',async(data)=>{
            await this.chatServices.sendPrivateMessage(this.socket,data)
        })
    }
    getConversationMessagesEvent(){
        this.socket.on('get-chat-history',async(data)=>{
            await this.chatServices.getConversationMessages(this.socket,data)
        })
    }
    sendGroupMessageEvent(){
        this.socket.on('send-group-message',async(data)=>{
            await this.chatServices.sendGroupMessage(this.socket,data)
        })
    }
    getGroupHistoryEvent(){
        this.socket.on('get-group-chat',async(data)=>{
            await this.chatServices.getGroupHistory(this.socket,data)
        })
    }
}