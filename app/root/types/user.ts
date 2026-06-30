import { UserTypeEnum } from '#generated/types/graphql';

export interface User {
    id: string;
    email: string;
    lastName: string;
    firstName: string;
    userType: UserTypeEnum;
}
