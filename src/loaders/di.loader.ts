import * as services from "../services";
import * as dependencies from "../config/dependency.config";
import * as models from "../models";
import { eventEmitter } from "../config";
import { EUserRoles, IUser } from "../types";
import { Model } from "mongoose";

// Moved out of models.helpers.ts to avoid circular dependency
const userModels = {
    [EUserRoles.STUDENT]: models.Student,
    [EUserRoles.INSTRUCTOR]: models.Instructor,
    [EUserRoles.SCHOOL_OFFICIAL]: models.SchoolOfficial,
};

// Dependency Injection Loader

export const errorService = new services.ErrorService();

export const jwtService = new services.JwtService(dependencies.jwt);

export const bcryptService = new services.BcryptService(dependencies.bcrypt);

export const authMiddlewareService = new services.AuthMiddlewareService(
    jwtService
);

export const courseService = new services.CourseService(
    models.Course,
    eventEmitter
);

export const locationService = new services.LocationService(models.Location);

export const schoolService = new services.SchoolService(models.School);

export const chatService = new services.ChatService(eventEmitter);

export function getUserModelByRole(role: EUserRoles): Model<IUser> {
    return (userModels as any)[role];
}

export const userService = new services.UserService(
    getUserModelByRole,
    models.User,
    locationService
);

export const metadataService = new services.MetadataService(
    schoolService,
    courseService,
    userService,
    chatService
);

export const authService = new services.AuthService(
    jwtService,
    bcryptService,
    userService,
    metadataService,
    eventEmitter
);

export const mailingListService = new services.MailingListService(
    models.MailingListSubscriber
);
