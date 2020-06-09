import express, { Application } from "express";
import cors from 'cors';

export default function (app: Application) {
    app.set('trust proxy', 1);
    app.use(express.json());
    app.use(cors());
}