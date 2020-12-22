import { Model, Types } from "mongoose";
import { refreshSchoolDatabase } from "../jobs";
import { ISchool, EModels, IQuery } from "../types";
import { model } from "../decorators";

export default class SchoolService {
    @model(EModels.SCHOOL)
    private School: Model<ISchool>;

    async findSchools(
        where: IQuery<ISchool> = {},
        options?: {
            sort?: object;
            skip?: number;
            limit?: number;
        }
    ): Promise<ISchool[]> {
        const schools = await this.School.find(where)
            .sort(options?.sort)
            .skip(options?.skip || 0)
            .limit(options?.limit ? Math.min(options?.limit, 20) : 20);

        return schools;
    }

    async findSchoolsByCoordinates(
        coordinates: number[],
        query: IQuery<ISchool> = {}
    ): Promise<ISchool[]> {
        const geoNearOptions: any = {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates,
                },
                distanceField: "distance.calculated",
                key: "location.geoJSON",
            },
        };
        const aggregateOptions: any[] = [geoNearOptions];

        if (query.filter) geoNearOptions.$geoNear.query = query.filter;
        if (query.sort) aggregateOptions.push({ $sort: query.sort });
        if (query.skip) aggregateOptions.push({ $skip: query.skip });

        aggregateOptions.push({
            $limit: query.limit ? Math.min(query.limit, 50) : 20,
        });

        const schools = await this.School.aggregate(aggregateOptions);
        return schools;
    }

    async findSchoolsByText(text: string): Promise<ISchool[]> {
        return await this.School.find({ $text: { $search: text } });
    }

    async findSchool(where: IQuery<ISchool>): Promise<ISchool> {
        return await this.School.findOne(where);
    }

    async findSchoolById(id: Types.ObjectId): Promise<ISchool> {
        return await this.School.findById(id);
    }

    async addStudentMetadata({
        studentIds,
        schoolIds,
    }: {
        studentIds: Types.ObjectId[];
        schoolIds: Types.ObjectId[];
    }): Promise<void> {
        await this.School.updateMany(
            { _id: { $in: schoolIds } },
            {
                $addToSet: { "meta.students": { $each: studentIds } },
            }
        );
    }

    async removeStudentMetadata({
        studentIds,
        schoolIds,
    }: {
        studentIds: Types.ObjectId[];
        schoolIds: Types.ObjectId[];
    }): Promise<void> {
        await this.School.updateMany(
            { _id: { $in: schoolIds } },
            {
                $pullAll: { "meta.students": studentIds },
            }
        );
    }

    async addSchoolOfficialMetadata({
        schoolOfficialIds,
        schoolIds,
    }: {
        schoolOfficialIds: Types.ObjectId[];
        schoolIds: Types.ObjectId[];
    }): Promise<void> {
        await this.School.updateMany(
            { _id: { $in: schoolIds } },
            {
                $addToSet: {
                    "meta.schoolOfficials": { $each: schoolOfficialIds },
                },
            }
        );
    }

    async removeSchoolOfficialMetadata({
        schoolOfficialIds,
        schoolIds,
    }: {
        schoolOfficialIds: Types.ObjectId[];
        schoolIds: Types.ObjectId[];
    }): Promise<void> {
        await this.School.updateMany(
            { _id: { $in: schoolIds } },
            {
                $pullAll: { "meta.schoolOfficials": schoolOfficialIds },
            }
        );
    }

    async addCourseMetadata({
        courseIds,
        schoolIds,
    }: {
        courseIds: Types.ObjectId[];
        schoolIds: Types.ObjectId[];
    }): Promise<void> {
        await this.School.updateMany(
            { _id: { $in: schoolIds } },
            {
                $addToSet: { "meta.courses": { $each: courseIds } },
            }
        );
    }

    async removeCourseMetadata({
        courseIds,
        schoolIds,
    }: {
        courseIds: Types.ObjectId[];
        schoolIds: Types.ObjectId[];
    }): Promise<void> {
        await this.School.updateMany(
            { _id: { $in: schoolIds } },
            {
                $pullAll: { "meta.courses": courseIds },
            }
        );
    }

    async refreshDatabase(options: { url?: string }) {
        return await refreshSchoolDatabase(options);
    }
}
