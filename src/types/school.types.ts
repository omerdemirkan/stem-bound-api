import { Types, Document, MongooseFilterQuery } from "mongoose";

export interface ISchoolDataOriginal {
    X: string;
    Y: string;
    FID: string;
    NCESID: string;
    NAME: string;
    ADDRESS: string;
    CITY: string;
    STATE: string;
    ZIP: string;
    ZIP4: string;
    TELEPHONE: string;
    TYPE: string;
    STATUS: string;
    POPULATION: string;
    COUNTY: string;
    COUNTYFIPS: string;
    COUNTRY: string;
    LATITUDE: string;
    LONGITUDE: string;
    NAICS_CODE: string;
    NAICS_DESC: string;
    SOURCE: string;
    SOURCEDATE: string;
    VAL_METHOD: string;
    VAL_DATE: string;
    WEBSITE: string;
    LEVEL_: string;
    ENROLLMENT: string;
    ST_GRADE: string;
    END_GRADE: string;
    DISTRICTID: string;
    FT_TEACHER: string;
    SHELTER_ID: string;
}

export interface ISchool extends Document {
    name: string;
    ncesid: string;
    districtId: string;
    startGrade: number;
    type: number;
    endGrade: number;
    status: number;
    location: {
        country: string;
        state: string;
        city: string;
        zip: string;
        county: string;
        latitude: number;
        longitude: number;
        geoJSON: {
            type: "Point";
            coordinates: number[];
        };
    };
    demographics: {
        enrollment: number;
        numTeachers: number;
        url: string;
    };
    contact: {
        telephone: string;
        website: string;
    };
}
