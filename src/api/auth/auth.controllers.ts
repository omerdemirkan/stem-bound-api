import { Request, Response } from "express";
import {
    jwtService,
    errorParser,
    authService,
    userService,
} from "../../services";
import { Types } from "mongoose";

const { ObjectId } = Types;

export async function me(req: Request, res: Response) {
    try {
        const userData = await userService.findUserById(
            ObjectId((req as any).payload.user._id)
        );

        if (!userData) {
            throw new Error("User seems to have been deleted.");
        }

        res.json({
            message: "Access token successfully refreshed",
            data: {
                user: userData,
                accessToken: jwtService.sign((req as any).payload),
            },
        });
    } catch (e) {
        res.status(errorParser.status(e)).json(errorParser.json(e));
    }
}

export async function signUp(req: Request, res: Response) {
    try {
        const { user, accessToken } = await authService.userSignUp({
            role: req.query.role || req.body.role,
            userData: req.body,
        });

        res.json({
            message: "User sign up successful",
            data: { user, accessToken },
        });
    } catch (e) {
        res.status(errorParser.status(e)).json(errorParser.json(e));
    }
}

export async function logIn(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        const loginResult = await authService.userLogin({
            email,
            password,
        });

        if (!loginResult) {
            return res
                .status(403)
                .json({ error: { message: "Username or Password Incorrect" } });
        }

        const { user, accessToken } = loginResult;

        res.json({
            message: "User log in successful",
            data: { user, accessToken },
        });
    } catch (e) {
        res.status(errorParser.status(e)).json(errorParser.json(e));
    }
}
