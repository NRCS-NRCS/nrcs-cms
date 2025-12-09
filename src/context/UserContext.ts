import { createContext } from 'react';
import type { User } from '../types/user';


export interface UserContextInterface {
    user: User | undefined;
    setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
    authenticated: boolean,
}

const UserContext = createContext<UserContextInterface>({
    authenticated: false,
    user: undefined,
    setUser: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setUser called on UserContext without a provider', value);
    },
});

export default UserContext;
