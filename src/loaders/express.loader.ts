import express, { Application } from "express";
import config from "../config";
import cors from "cors";
import fileUpload from "express-fileupload";

const corsMiddleware = cors({
    credentials: true,
    origin: config.clientOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

export default function expressLoader(app: Application) {
    app.use(fileUpload());
    app.disable("x-powered-by");
    app.set("trust proxy", 1);
    app.set("trust proxy", "loopback, 0.0.0.0");
    app.use(express.json());
    app.use(corsMiddleware);
}
