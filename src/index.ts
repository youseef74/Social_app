import express from 'express';
import 'dotenv/config';
import * as controllers from './Modules/controller.index.js';
import { dbConnection } from './DB/db.connection.js';
import { NextFunction, Request, Response } from 'express';
import { httpException } from './Utils/index.js';
import { failedResponse } from './Utils/Response/response.helper.utils.js';


//express app
const app = express();
app.use(express.json());




//database connection
dbConnection();

//routes
app.use('/api/auth', controllers.authController);
app.use('/api/profile', controllers.profileController);
app.use('/api/posts', controllers.postsController);
app.use('/api/comments', controllers.commentsController);
app.use('/api/reacts', controllers.reactsController);

//error handling middleware
app.use((err:httpException | null, req:Request, res:Response, next:NextFunction)=>{
    res.status(err?.statusCode || 500).json(failedResponse(err?.message,err?.statusCode,err?.error));
} )

//server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})