import { EventEmitter } from "events";
import { emitter } from "../decorators";
import { getTokenPayload } from "../helpers";
import { inject, injectable } from "inversify";
import {
    EUserRoles,
    ITokenPayload,
    EUserEvents,
    IUser,
    IAuthService,
    IJwtService,
    IBcryptService,
    IUserService,
} from "../types";
import { SERVICE_SYMBOLS } from "../constants/service.constants";

@injectable()
class AuthService implements IAuthService {
    @emitter()
    private eventEmitter: EventEmitter;

    constructor(
        @inject(SERVICE_SYMBOLS.JWT_SERVICE) protected jwtService: IJwtService,
        @inject(SERVICE_SYMBOLS.BCRYPT_SERVICE)
        protected bcryptService: IBcryptService,
        @inject(SERVICE_SYMBOLS.USER_SERVICE)
        protected userService: IUserService
    ) {}

    async userSignUp(
        userData: Partial<IUser>,
        role: EUserRoles
    ): Promise<{ user: IUser; accessToken: string }> {
        const newUser = await this.userService.createUser(userData, role);

        const payload: ITokenPayload = getTokenPayload(newUser);

        const accessToken = await this.jwtService.sign(payload);

        this.eventEmitter.emit(EUserEvents.USER_SIGNUP_COMPLETED, newUser);
        return { user: newUser, accessToken };
    }

    async userLogin(
        email: string,
        password: string
    ): Promise<{ user: any; accessToken: string } | null> {
        const user = await this.userService.findUserByEmail(email);

        if (!user) {
            return null;
        }

        if (await this.bcryptService.compare(password, user.hash)) {
            const payload: ITokenPayload = getTokenPayload(user);

            const accessToken = await this.jwtService.sign(payload);
            return { user, accessToken };
        }

        return null;
    }
}

export default AuthService;
