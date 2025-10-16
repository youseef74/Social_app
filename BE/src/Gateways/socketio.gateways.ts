import { Server, Socket } from "socket.io";
import {Server as HttpServer} from "http";
import { verifyToken } from "../Utils/token.js";
import { chatInitiation } from "../Modules/Chats/chats.js";


let io:Server | null = null
export const connectedSockets = new Map<string,string[]>()

function socketAuthentication(socket:Socket,next:Function){
    const token = socket.handshake.auth.authorization
    const decodedData = verifyToken(token, process.env.JWT_SECRET_KEY as string);
    if(!decodedData || typeof decodedData === "string"){
        return next(new Error("unauthorized"))
    }
    socket.data = {userId:decodedData._id}

    const userTaps = connectedSockets.get(decodedData._id)
    if(!userTaps) connectedSockets.set(decodedData._id,[socket.id])
        else userTaps.push(socket.id)   
       socket.emit("connected",{user:{_id:socket.data.userId,firstName:decodedData.firstName,lastName:decodedData.lastName,profileImage:decodedData.profileImage}})             
    next() 
}

function socketDisconnected(socket:Socket){
    const userId = socket.data.userId
    let userTaps = connectedSockets.get(userId)
    if(userTaps && userTaps.length>=1){
        userTaps = userTaps.filter((taps)=>taps!==socket.id)
        if(userTaps.length===0) connectedSockets.delete(userId)
    }
    socket.broadcast.emit("disconnected",{userId,socketId:socket.id})
}
export const ioInitializer = (server:HttpServer)=>{
    io = new Server(server,{cors:{origin:"*"}})

    io.use(socketAuthentication)
io.on('connection',(socket:Socket)=>{
    chatInitiation(socket)
    socketDisconnected(socket)
})
}

export const getIo = ()=>{
    try {
        if(!io) throw new Error("io is not initialized")
            return io
    } catch (error) {
        console.log(error);
        
    }
}