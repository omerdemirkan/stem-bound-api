import { Types } from "mongoose";
import { Response } from "express";
import { chatService, errorService } from "../../../../services";
import { IMessage, EErrorTypes, IModifiedRequest } from "../../../../types";
import {
    configureMessageArrayQuery,
    configureMessageArrayResponseData,
} from "../../../../helpers/chat.helpers";

const { ObjectId } = Types;

export async function getChatMessages(req: IModifiedRequest, res: Response) {
    try {
        const chatId = ObjectId(req.params.chatId);
        const query = configureMessageArrayQuery(req.meta);
        // For hasMore functionality
        query.limit += 1;
        const messages: IMessage[] = await chatService.findMessagesByChatId(
            chatId,
            query
        );
        res.json({
            message: "Chat successfully fetched",
            data: configureMessageArrayResponseData(
                messages.slice(0, messages.length),
                req.meta
            ),
            hasMore: messages.length === query.limit,
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}

export async function createChatMessage(req: IModifiedRequest, res: Response) {
    try {
        const requestingUserId = ObjectId(req.payload.user._id);
        const chatId = ObjectId(req.params.chatId);
        let messageData: Partial<IMessage> = req.body;
        messageData.meta.from = requestingUserId;
        const message = await chatService.createMessage(chatId, messageData);
        res.json({
            message: "Chat message successfully created",
            data: message,
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}

export async function getChatMessage(req: IModifiedRequest, res: Response) {
    try {
        const requestingUserId = ObjectId(req.payload.user._id);
        const chatId = ObjectId(req.params.chatId);
        const messageId = ObjectId(req.params.messageId);
        const message = await chatService.findMessageById(messageId);

        if (message.meta.chat !== chatId) {
            errorService.throwError(
                EErrorTypes.DOCUMENT_NOT_FOUND,
                "Chat not found"
            );
        } else if (
            !(
                await chatService.findChatById(message.meta.chat)
            ).meta.users.includes(requestingUserId)
        ) {
            errorService.throwError(EErrorTypes.FORBIDDEN, "Not Authorized");
        }

        res.json({
            message: "Message successfully fetched",
            data: message,
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}

export async function updateChatMessage(req: IModifiedRequest, res: Response) {
    try {
        const requestingUserId = ObjectId(req.payload.user._id);
        const messageData: Partial<IMessage> = req.body;
        const message = await chatService.updateMessage(messageData, {
            _id: ObjectId(req.params.messageId),
            "meta.from": requestingUserId,
        });
        res.json({
            message: "Message successfully updated",
            data: message,
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}

export async function deleteChatMessage(req: IModifiedRequest, res: Response) {
    try {
        const message = await chatService.setMessageDeletionById(
            ObjectId(req.params.messageId),
            true
        );

        res.json({
            message: "Message successfully deleted",
            data: message,
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}
