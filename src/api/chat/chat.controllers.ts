import { Request, Response } from "express";
import { errorParser, chatService } from "../../services";
import { Types } from "mongoose";

const { ObjectId } = Types;

export async function createChat(req: Request, res: Response) {
    try {
        const chatData = req.body;
        const chat: any = await chatService.createChat(chatData);

        const userId = (req as any).payload.user._id;
        if (!chat.meta.users.includes(userId)) {
            throw new Error("User id must be included in chat metadata.");
        }
        res.json({
            message: "Chat successfully created",
            data: chat,
        });
    } catch (e) {
        res.status(errorParser.status(e)).json(errorParser.json(e));
    }
}

export async function getChatById(req: Request, res: Response) {
    try {
        const id = ObjectId(req.params.id);
        const chat: any = await chatService.findChatById(id);
        if (!chat.meta.users.includes((req as any).payload.user._id)) {
            res.status(403);
        }
        res.json({
            message: "Chat successfully fetched",
            data: chat,
        });
    } catch (e) {
        res.status(errorParser.status(e)).json(errorParser.json(e));
    }
}
