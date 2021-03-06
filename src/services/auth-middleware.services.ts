import { Response, NextFunction } from "express";
import { logger } from "../config";
import { inject, injectable } from "inversify";
import {
    EUserRoles,
    IModifiedRequest,
    IRequestValidationFunction,
    ITokenPayload,
    IAuthMiddlewareService,
    IJwtService,
} from "../types";
import { SERVICE_SYMBOLS } from "../constants/service.constants";

@injectable()
class AuthMiddlewareService implements IAuthMiddlewareService {
    constructor(
        @inject(SERVICE_SYMBOLS.JWT_SERVICE) protected jwtService: IJwtService
    ) {}

    extractTokenPayload = async (
        req: IModifiedRequest,
        res: Response,
        next: NextFunction
    ) => {
        const authHeader: string | undefined = req.headers.authorization;
        const token: string | null = authHeader
            ? authHeader.split(" ")[1]
            : null;

        if (!token)
            return res.status(401).json({
                message: "Valid token not found.",
            });

        try {
            req.payload = (await this.jwtService.verify(
                token
            )) as ITokenPayload;
            req.meta.payload = req.payload;
            next();
        } catch (e) {
            logger.info(e);
            res.sendStatus(403);
        }
    };

    allowedRoles(allowedRoles: (EUserRoles | "ADMIN")[]) {
        return async function (
            req: IModifiedRequest,
            res: Response,
            next: NextFunction
        ) {
            if (allowedRoles.includes(req.payload.user.role)) {
                next();
            } else {
                logger.error("Invalid user role");
                res.sendStatus(403);
            }
        };
    }

    // To ensure that any changes to a user is made by the user or by an admin.
    matchParamIdToPayloadUserId(
        req: IModifiedRequest,
        res: Response,
        next: NextFunction
    ) {
        const id = req.params.id;
        const payloadId = req.payload.user._id || null;
        if (id === payloadId || req.payload.user.role === "ADMIN") {
            next();
        } else {
            res.sendStatus(403);
        }
    }

    blockRequestBodyMetadata(
        req: IModifiedRequest,
        res: Response,
        next: NextFunction
    ) {
        if (!req.body.meta) {
            next();
        } else {
            res.status(400).json({
                error: {
                    message: "Metadata cannot be updated from this route.",
                },
            });
        }
    }

    validateRequest(comparisonFunction: IRequestValidationFunction) {
        return function (
            req: IModifiedRequest,
            res: Response,
            next: NextFunction
        ) {
            try {
                const { body, payload, params } = req as any;
                if (!comparisonFunction({ body, payload, params }))
                    throw new Error();
                next();
            } catch (e) {
                res.sendStatus(403);
            }
        };
    }
}

export default AuthMiddlewareService;
