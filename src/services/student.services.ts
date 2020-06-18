import { Model, Document, Types } from 'mongoose';
import { EventEmitter } from 'events';
import { EUserRoles, EUserEvents } from '../types';

export default class StudentService {
    constructor(
        private Students: Model<Document>,
        private eventEmitter: EventEmitter
    ) { }

    async createStudent(student: any) {
        if (student.password) throw new Error("We don't store passwords around here fella!")
        
        const newStudent = await this.Students.create(student);

        this.eventEmitter.emit(EUserEvents.USER_SIGNUP, { 
            role: EUserRoles.INSTRUCTOR, 
            user: newStudent
        });

        return newStudent;
    }

    async findStudents(where: object = {}, options?: {
        sort?: object,
        skip?: number,
        limit?: number
    }) {
        const students = await this.Students
        .find(where)
        .sort(options?.sort)
        .skip(options?.skip || 0)
        .limit(options?.limit || 20)

        return students;
    }

    async findStudent(where: object) {
        return await this.Students.findOne(where)
    }

    async findStudentById(id: Types.ObjectId) {
        return await this.Students.findById(id);
    }

    async findStudentByEmail(email: string) {
        return await this.Students.findOne({ email })
    }

    async updateStudent(where: object, newStudent: object) {
        return await this.Students.findOneAndUpdate(where, newStudent);
    }

    async updateStudentById(id: Types.ObjectId, newStudent: object) {
        return await this.Students.findByIdAndUpdate(id, newStudent);
    }

    async deleteStudent(where: object) {
        return await this.Students.findOneAndDelete(where);
    }

    async deleteStudentById(id: Types.ObjectId) {
        return await this.deleteStudent({ _id: id })
    }

    async addCourseMetadata(options: {
        studentId: Types.ObjectId,
        courseId: Types.ObjectId
    } | {
        studentIds: Types.ObjectId[],
        courseId: Types.ObjectId
    }) {
        const update = { $push: { 'meta.courses': options.courseId } }
        
        if ((options as any).studentIds) {
            await this.Students.updateMany({ _id: { $in: (options as any).studentIds } }, update)
        } else {
            await this.Students.updateOne({ _id: (options as any).studentId }, update);
        }
    }

    async removeCourseMetadata(options: {
        studentId: Types.ObjectId,
        courseId: Types.ObjectId
    } | {
        studentIds: Types.ObjectId[],
        courseId: Types.ObjectId
    }) {
        const update = { $pull: { 'meta.courses': options.courseId } }
        
        if ((options as any).studentIds) {
            await this.Students.updateMany({ _id: { $in: (options as any).studentIds } }, update)
        } else {
            await this.Students.updateOne({ _id: (options as any).studentId }, update);
        }
    }
}