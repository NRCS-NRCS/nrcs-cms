import {
    useMemo,
    useState,
} from 'react';
import { Outlet } from 'react-router';

import UserContext, { type UserContextInterface } from '#contexts/UserContext';

import type { User } from './types/user';

function Root() {
    const [user, setUser] = useState<User | undefined>();
    const authenticated = !!user;
    const userContext: UserContextInterface = useMemo(
        () => ({
            authenticated,
            user,
            setUser,

        }),
        [
            authenticated,
            user,
            setUser,
        ],
    );
    return (
        <div>
            <h1>Root</h1>
            <UserContext.Provider value={userContext}>
                <Outlet />
            </UserContext.Provider>
        </div>
    );
}

export default Root;
