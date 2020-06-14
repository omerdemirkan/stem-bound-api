import { Container } from 'typedi';
import { Router } from 'express';

import * as schoolOfficialControllers from './school-official.controllers';
import { UserRolesEnum } from '../../../config/types.config';
import { AuthMiddlewareService } from '../../../services';

const schoolOfficialRouter = Router();
const authMiddlewareService: AuthMiddlewareService = Container.get(AuthMiddlewareService);


schoolOfficialRouter.get(
    '/',
    schoolOfficialControllers.getSchoolOfficials
);

schoolOfficialRouter.get(
    '/:id',
    schoolOfficialControllers.getSchoolOfficialById
);

schoolOfficialRouter.patch(
    '/:id',
    authMiddlewareService.allowedRoles([UserRolesEnum.SCHOOL_OFFICIAL, UserRolesEnum.ADMIN]),
    schoolOfficialControllers.updateSchoolOfficialById
);

// Because delete requests often don't use a request body.
// Not a rest-ful approach but the most efficient in practice.

schoolOfficialRouter.post(
    '/delete-many',
    authMiddlewareService.allowedRoles([UserRolesEnum.ADMIN]),
    schoolOfficialControllers.deleteSchoolOfficialsByIds
);

schoolOfficialRouter.delete(
    '/:id',
    authMiddlewareService.allowedRoles([UserRolesEnum.ADMIN]),
    schoolOfficialControllers.deleteSchoolOfficialById
);

export default schoolOfficialRouter;