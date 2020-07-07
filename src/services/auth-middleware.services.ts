import { JwtService } from ".";
import { Request, Response, NextFunction } from "express";
import { EUserRoles, RequestBodyPayloadComparisonFunction } from "../types";
import { logger } from "../config";

export default class AuthMiddlewareService {
    constructor(private jwtService: JwtService) {}

    extractTokenPayload = async (
        req: Request,
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
            (req as any).payload = await this.jwtService.verify(token);
            next();
        } catch (e) {
            logger.info(e);
            res.sendStatus(403);
        }
    };

    allowedRoles(allowedRoles: (EUserRoles | "ADMIN")[]) {
        return async function (
            req: Request,
            res: Response,
            next: NextFunction
        ) {
            const { role } = (req as any).payload;

            if (allowedRoles.includes(role)) {
                next();
            } else {
                res.sendStatus(403);
            }
        };
    }

    // To ensure that any changes to a user is made by the user or by an admin.
    matchParamIdToPayloadUserId(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const id = req.params.id;
        const payloadId = (req as any).payload.user._id || null;
        if (id === payloadId || (req as any).payload.role === "ADMIN") {
            next();
        } else {
            res.sendStatus(403);
        }
    }

    // matchParamIdToPayloadValue({ key }: { key: string }) {
    //     const keys = key.split('.');
    //     return function (req: Request, res: Response, next: NextFunction) {

    //         const paramId = req.params.id;

    //         let payloadId = (req as any).payload;
    //         keys.forEach(key => {
    //             payloadId = payloadId[key]
    //         })

    //         if (paramId === payloadId || (req as any).payload.role ==="ADMIN") {
    //             next();
    //         } else {
    //             res.sendStatus(403);
    //         }
    //     }
    // }

    blockRequestBodyMetadata(req: Request, res: Response, next: NextFunction) {
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

    compareRequestBodyToPayload(
        comparisonFunction: RequestBodyPayloadComparisonFunction
    ) {
        return function (req: Request, res: Response, next: NextFunction) {
            try {
                const { body, payload } = req as any;
                if (!comparisonFunction({ body, payload })) throw new Error();

                next();
            } catch (e) {
                res.sendStatus(403);
            }
        };
    }
}
