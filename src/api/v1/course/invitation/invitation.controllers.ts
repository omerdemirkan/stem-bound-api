import { Router } from "express";
import { authMiddlewareService } from "../../../../services";
import { EUserRoles } from "../../../../types";
import * as invitationControllers from "./invitation.routes";

const invitationRouter = Router({
    mergeParams: true,
});

invitationRouter.post(
    "/send-instructor-invitation",
    authMiddlewareService.extractTokenPayload,
    authMiddlewareService.allowedRoles([EUserRoles.INSTRUCTOR]),
    invitationControllers.inviteInstructor
);

export default invitationRouter;