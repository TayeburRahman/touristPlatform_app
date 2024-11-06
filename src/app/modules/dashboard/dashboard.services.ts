/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';
// import Conversation from './conversation.model';
// import Message from './message.model';
import ApiError from '../../../errors/ApiError';
import User from '../auth/auth.model';
 
const sendMessage = async (req: Request) => {
  const { id: receiverId, } = req.params;
  const senderId = req.user?.userId;
 

//   return newMessage;
};

 

export const dashboardService = {
  sendMessage, 
};
