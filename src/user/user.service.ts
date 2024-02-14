import { Injectable } from '@nestjs/common';

type User = {
    id?: number;
    name: string;
    email: string;
};
@Injectable()
export class UserService {
    private userArr: Required<User>[];
    constructor() {
        this.userArr = [];
    }

    async createUserService(userData: User): Promise<string> {
        if (this.userArr.map((value) => value.email).includes(userData.email)) {
            throw new Error('User Already Exists.');
        }
        const userDataSet: Required<User> = {
            ...userData,
            id: this.userArr.length + 1,
        };
        this.userArr.push(userDataSet);
        return 'User Registered Successfully.';
    }
}
