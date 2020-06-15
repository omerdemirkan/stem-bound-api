import { Container } from 'typedi';
import { Request, Response } from 'express';
import { Types } from 'mongoose';

import InstructorService from './instructor.services';
import { ErrorParserService } from '../../../services';

const { ObjectId } = Types
const instructorService = Container.get(InstructorService);
const errorParser: ErrorParserService = Container.get(ErrorParserService)

export async function createInstructor(req: Request, res: Response) {
    try {
        const instructorData = req.body;
        const user: any = await instructorService.createInstructor(instructorData);

        res.json({
            data: { user }
        })
    } catch (e) {
        res
        .status(errorParser.status(e))
        .json(errorParser.json(e));
    }
}

export async function getInstructors(req: Request, res: Response) {
    try {
        const data = await instructorService.findInstructors()
        res.json({
            data
        });
    } catch (e) {
        res
        .status(errorParser.status(e))
        .json(errorParser.json(e))
    }
}

export async function getInstructorById(req: Request, res: Response) {
    try {
        const id = ObjectId(req.params.id);
        const data = await instructorService.findInstructorById(id)
        res.json({
            data
        });
    } catch (e) {
        res
        .status(errorParser.status(e))
        .json(errorParser.json(e))
    }
}

export async function updateInstructorById(req: Request, res: Response) {
    try {
        if (req.body.meta) throw new Error('metadata cannot be updated from this route');
        const id = ObjectId(req.params.id);
        const newInstructor = req.body;
        const data = await instructorService.updateInstructorById(id, newInstructor);

        res.json({
            data
        })
    } catch (e) {
        res
        .status(errorParser.status(e))
        .json(errorParser.json(e))
    }
}

export async function deleteInstructorById(req: Request, res: Response) {
    try {
        const id = ObjectId(req.params.id);
        const data = await instructorService.deleteInstructorById(id);
        res.json({
            data
        });
    } catch (e) {
        res
        .status(errorParser.status(e))
        .json(errorParser.json(e))
    }
}