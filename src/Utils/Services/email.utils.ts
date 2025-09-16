import nodemailer from 'nodemailer';
import { EventEmitter } from 'events';
import { IEmailArgs } from '../../Common/Interfaces/user.interface.js';

export const sendMail = async({
    to,
    cc,
    subject,
    content,
    attachments = []
}:IEmailArgs)=>{

    const transporter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:465,
        secure:true,
        auth:{
            user:process.env.USER_EMAIL,
            pass:process.env.USER_PASSWORD
        },tls: {
            rejectUnauthorized: false
          }
    })

    const info = await transporter.sendMail({
        from:'kandilyossef100@gmail.com',
        to,
        cc,
        subject,
        html:content,
        attachments
    })

    console.log("Email sent successfully",info);
    
    return info
}


export const localEmitter = new EventEmitter()


localEmitter.on('sendEmail',(args:IEmailArgs)=>{
    console.log('sending email...');
    sendMail(args)
})

    
