import React, {
    use,
    useCallback,
} from 'react';
import { useNavigate } from 'react-router';
import {
    Button,
    DropdownMenu,
    Heading,
} from '@ifrc-go/ui';
import { gql } from 'urql';

import UserContext from '#contexts/UserContext';
import { useLogoutMutation } from '#generated/types/graphql';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGOUT = gql`
    mutation Logout {
        logout
    }
`;

function Navbar() {
    const { user, setUser } = use(UserContext);
    const navigate = useNavigate();

    const [{ fetching }, triggerLogout] = useLogoutMutation();

    const handleLogout = useCallback(async () => {
        const res = await triggerLogout({});
        const logoutResponse = res.data?.logout;
        if (logoutResponse) {
            setUser(undefined);
            navigate('/login');
        }
    }, [navigate, triggerLogout, setUser]);

    return (
        <nav className={styles.navbar}>
            <Heading className={styles.title}>NRCS</Heading>
            <DropdownMenu
                variant="tertiary"
                label={(
                    <div className={styles.userInfo}>
                        <Heading level={5}>
                            {user?.firstName}
                            {' '}
                            {user?.lastName}
                        </Heading>
                        <Heading level={6}>
                            Admin
                        </Heading>
                    </div>
                )}
            >
                <React.Fragment key=".0">
                    <Button
                        name="logout"
                        variant="tertiary"
                        className={styles.dropdownOption}
                        onClick={handleLogout}
                    >
                        {fetching ? 'Logging out' : 'Logout'}
                    </Button>
                </React.Fragment>
            </DropdownMenu>
        </nav>
    );
}

export default Navbar;
