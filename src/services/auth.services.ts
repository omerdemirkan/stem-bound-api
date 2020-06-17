import { Service, Container } from 'typedi';
import InstructorService from './instructor.services';
import SchoolOfficialService from './school-official.services';
import StudentService from './student.services';
import { JwtService, BcryptService } from '.';
import { EUserRoles } from '../types';
import SchoolService from './school.services';

const schoolService = Container.get(SchoolService);

@Service()
export default class AuthService {
    constructor(
        private studentService: StudentService,
        private instructorService: InstructorService,
        private schoolOfficialService: SchoolOfficialService,
        private jwtService: JwtService,
        private bcryptService: BcryptService
    ) { }

    async userSignUp({ role, userData }: {
        role: EUserRoles,
        userData: object
    }): Promise<{ accessToken: string, user: any }> {

        await this.bcryptService.removePasswordAndInsertHash(userData);

        let user: any;
        switch (role) {
            case EUserRoles.INSTRUCTOR:

                user = await this.instructorService.createInstructor(userData);
                break;
            case EUserRoles.SCHOOL_OFFICIAL:

                user = await this.schoolOfficialService.createSchoolOfficial(userData);
                await schoolService.addSchoolOfficialMetadata({
                    schoolId: user.meta.school,
                    schoolOfficialId: user._id
                })
                break;
            case EUserRoles.STUDENT:

                user = await this.studentService.createStudent(userData);
                await schoolService.addStudentMetadata({
                    studentId: user._id,
                    schoolId: user.meta.school
                })
                break;
            default:
                throw new Error('Invalid role.')
        }

        const accessToken = this.jwtService.sign({
            role,
            user
        })

        return {
            accessToken,
            user
        }
    }

    async userLogin({ role, email, password }: {
        role: EUserRoles,
        email: string,
        password: string
    }): Promise<{ accessToken: string, user: any } | undefined> {
        let user: any;
        switch (role) {
            case EUserRoles.INSTRUCTOR:
                user = await this.instructorService.findInstructorByEmail(email);
                break;
            case EUserRoles.SCHOOL_OFFICIAL:
                user = await this.schoolOfficialService.findSchoolOfficialByEmail(email);
                break;
            case EUserRoles.STUDENT:
                user = await this.studentService.findStudentByEmail(email);
                break;
            default:
                throw new Error('Invalid role.')
        }

        if (await this.bcryptService.compare(password, user.hash)) {
            const accessToken = this.jwtService.sign({
                role,
                user
            })
    
            return {
                accessToken,
                user
            }
        }
    }
}