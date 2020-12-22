import { Request, Response, json } from "express";
import {
    errorService,
    userService,
    metadataService,
    courseService,
    schoolService,
    chatService,
} from "../../../services";
import { configureUsersQuery } from "../../../helpers/user.helpers";
import { Types } from "mongoose";
import {
    IUser,
    IStudent,
    IInstructor,
    ISchoolOfficial,
    ICourse,
    IUserQueryOptions,
    IChat,
    EErrorTypes,
    IModifiedRequest,
} from "../../../types";
import { configureChatArrayResponseData } from "../../../helpers/chat.helpers";
import { configureCourseArrayResponseData } from "../../../helpers";
import { saveFileToBucket } from "../../../jobs";

const { ObjectId } = Types;

export async function getUsers(req: IModifiedRequest, res: Response) {
    try {
        const query: IUserQueryOptions = configureUsersQuery(req.query, req.ip);
        let users: IUser[] = await userService.findUsers(query);
        res.json({
            message: "Users successfully found",
            data: users,
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}

export async function getUser(req: IModifiedRequest, res: Response) {
    try {
        const id = ObjectId(req.params.id);
        const user: IUser = await userService.findUserById(id);
        if (!user) {
            errorService.throwError(
                EErrorTypes.DOCUMENT_NOT_FOUND,
                "User not found"
            );
        }

        res.json({
            message: "User successfully fetched",
            data: user,
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}

export async function updateUser(req: IModifiedRequest, res: Response) {
    try {
        const updatedUser: IUser = await userService.updateUserById(
            ObjectId(req.payload.user._id),
            req.body
        );

        res.json({
            message: "User successfully updated",
            data: updatedUser,
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}

export async function deleteUser(req: IModifiedRequest, res: Response) {
    try {
        const deletedUser: IUser = await userService.deleteUserById(
            ObjectId(req.payload.user._id)
        );

        await metadataService.handleDeletedUserMetadataUpdate(deletedUser);
        res.json({
            message: "User successfully deleted",
            data: deletedUser,
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}

export async function getUserCourses(req: IModifiedRequest, res: Response) {
    try {
        const user: IUser = await userService.findUserById(
            ObjectId(req.params.id)
        );
        if (!user) {
            errorService.throwError(
                EErrorTypes.DOCUMENT_NOT_FOUND,
                "User not found"
            );
        }
        const courseIds = (user as IStudent | IInstructor).meta.courses;
        const courses: ICourse[] = courseIds.length
            ? await courseService.findCoursesByIds(courseIds)
            : [];

        res.json({
            message: "User courses successfully fetched",
            data: configureCourseArrayResponseData(courses, req.meta),
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}

export async function getUserSchool(req: IModifiedRequest, res: Response) {
    try {
        const user: IUser = await userService.findUserById(
            ObjectId(req.params.id)
        );
        if (!user) {
            errorService.throwError(
                EErrorTypes.DOCUMENT_NOT_FOUND,
                "User not found"
            );
        }
        const schoolId = (user as IStudent | ISchoolOfficial).meta.school;
        const school = await schoolService.findSchoolById(schoolId);

        res.json({
            message: "User courses successfully fetched",
            data: school,
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}

export async function getUserChats(req: IModifiedRequest, res: Response) {
    try {
        const userId = ObjectId(req.params.id);
        if (req.query.user_ids) {
            const chats = await chatService.findChatsByUserIds(
                [
                    ...req.params.user_ids.split(",").map((id) => ObjectId(id)),
                    userId,
                ],
                {
                    exact: !!req.query.exact,
                }
            );
            return res.json({
                message: "Chat messages successfully fetched",
                data: configureChatArrayResponseData(chats, req),
            });
        }

        const user: IUser = await userService.findUserById(userId);

        if (!user) {
            errorService.throwError(
                EErrorTypes.DOCUMENT_NOT_FOUND,
                "User not found"
            );
        }

        const chatIds = user.meta.chats;
        const chats: IChat[] = chatIds.length
            ? await chatService.findChatsByIds(chatIds)
            : [];

        res.json({
            message: "User chats successfuly fetched",
            data: configureChatArrayResponseData(chats, req),
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}

export async function updateUserProfilePicture(
    req: IModifiedRequest,
    res: Response
) {
    try {
        const file: any = req.files.file;
        const profilePictureUrl = await saveFileToBucket(file);

        const user = await userService.updateUserProfilePictureUrl(
            ObjectId(req.payload.user._id),
            profilePictureUrl
        );

        res.json({
            data: user,
            message: "User profile picture successfully updated",
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}

export async function updateUserLocation(req: IModifiedRequest, res: Response) {
    try {
        const userId = ObjectId(req.payload.user._id);
        const updatedUser = await userService.updateUserLocationByZip(
            userId,
            req.body.zip as string
        );

        res.json({
            message: "User location successfully updated",
            data: updatedUser,
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}
