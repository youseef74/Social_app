import { Socket } from "socket.io";
import { ConversationRepository } from "../../../DB/Repositories/conversation.repository.js";
import { ConversationModel } from "../../../DB/Models/conversation.model.js";
import { MessagesRepository } from "../../../DB/Repositories/messages.repository.js";
import { MessageModel } from "../../../DB/Models/messages.model.js";
import { getIo } from "../../../Gateways/socketio.gateways.js";


export class ChatService{

    private conversationRepository:ConversationRepository = new ConversationRepository(ConversationModel as any)
    private messageRepository:MessagesRepository = new MessagesRepository(MessageModel as any)

    async joinPrivateChat(socket:Socket,targetUserId:String){
        let conversation = await this.conversationRepository.findOneDocument({
            type:"direct",
            members:{$all:[socket.data.userId,targetUserId]}
        })
        if(!conversation){
            conversation = await this.conversationRepository.createDocument({
                type:"direct",
                members:[socket.data.userId,targetUserId]
            })

        }

        socket.join(conversation._id.toString())
        return conversation
    }

    async sendPrivateMessage(socket:Socket,data:unknown){
        const {text,targetUserId} = data as{text:string,targetUserId:string}
        const conversation = await this.joinPrivateChat(socket,targetUserId)
        const message = await this.messageRepository.createDocument({
            text,
            conversationId:conversation._id,
            senderId:socket.data.userId,

        })

        getIo()?.to(conversation._id.toString()).emit("message-sent",message)


    }

    async getConversationMessages(socket:Socket,targetUserId:String){
        const conversation = await this.joinPrivateChat(socket,targetUserId)
        const messages = await this.messageRepository.findDocuments({conversationId:conversation._id})

        socket.emit("chat-history",messages)
    }

    async joinGroupChat(socket:Socket,targetGroupId:String){
        let conversation = await this.conversationRepository.findOneDocument({
            _id:targetGroupId,
            type:"group"
        })
        if(!conversation) throw new Error("Conversation not found")

            socket.join(conversation._id.toString())
            return conversation
    }

    async sendGroupMessage(socket:Socket,data:unknown){
        const{text,targetGroupId} = data as{text:string,targetGroupId:string}
        const conversation = await this.joinGroupChat(socket,targetGroupId)

        const message = await this.messageRepository.createDocument({
            text,
            conversationId:conversation._id,
            senderId:socket.data.userId,
        })
        getIo()?.to(conversation._id.toString()).emit("message-sent",message)
    }

    async getGroupHistory(socket:Socket,targetGroupId:String){
        const messages = await this.messageRepository.findDocuments({conversationId:targetGroupId})
        socket.emit("group-chat-history",messages)
        
    }
}