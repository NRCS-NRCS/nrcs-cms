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
import useAlert from '#hooks/useAlert';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGOUT = gql`
    mutation Logout {
        logout
    }
`;

function Navbar() {
    const { user, setUser } = use(UserContext);
    const alert = useAlert();
    const navigate = useNavigate();

    const [{ fetching: pendingLogout }, triggerLogout] = useLogoutMutation();

    const handleLogout = useCallback(async () => {
        const res = await triggerLogout({});
        const logoutResponse = res.data?.logout;
        if (logoutResponse) {
            setUser(undefined);
            navigate('/login');
            alert.show('Logout Successful', { variant: 'success' });
        }
    }, [navigate, triggerLogout, setUser, alert]);

    return (
        <nav className={styles.navbar}>
            <Heading className={styles.title} level={2}>NRCS</Heading>
            <DropdownMenu
                labelStyleVariant="action"
                labelColorVariant="secondary"
                labelBefore={(
                    <div className={styles.userInitial}>
                        {user?.firstName.charAt(0)}
                        {user?.lastName.charAt(0)}
                    </div>
                )}
                label={(
                    <div className={styles.userInfo}>
                        <Heading level={6}>
                            {user?.firstName}
                            {' '}
                            {user?.lastName}
                        </Heading>
                        <span>
                            Admin
                        </span>
                    </div>
                )}
            >
                <React.Fragment key=".0">
                    <Button
                        name="logout"
                        styleVariant="transparent"
                        onClick={handleLogout}
                        disabled={pendingLogout}
                        withFullWidth
                    >
                        {pendingLogout ? 'Logging out' : 'Logout'}
                    </Button>
                </React.Fragment>
            </DropdownMenu>
        </nav>
    );
}

export default Navbar;
