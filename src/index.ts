import express from 'express';
import * as controllers from './Modules/controller.index.js';
import 'dotenv/config';
import { dbConnection } from './DB/db.connection.js';
import { NextFunction, Request, Response } from 'express';

const app = express();
app.use(express.json());

dbConnection();

app.use('/api/auth', controllers.authController);
app.use('/api/profile', controllers.profileController);
app.use('/api/posts', controllers.postsController);
app.use('/api/comments', controllers.commentsController);
app.use('/api/reacts', controllers.reactsController);

//error handling middleware
app.use((err:Error | null, req:Request, res:Response, next:NextFunction)=>{
    const status = 500;
    const message = err?.message || "Something went wrong";

    res.status(status).json({message});
} )

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})