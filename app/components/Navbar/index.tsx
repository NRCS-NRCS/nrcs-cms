import React, {
    use,
    useCallback,
} from 'react';
import {
    Button,
    DropdownMenu,
    Heading,
    Image,
} from '@ifrc-go/ui';
import { gql } from 'urql';

import Link from '#components/Link';
import UserContext from '#contexts/UserContext';
import { useLogoutMutation } from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import logo from '#resources/image/redCrossBanner.png';

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
    const navigate = useRouting();

    const [{ fetching: pendingLogout }, triggerLogout] = useLogoutMutation();

    const handleLogout = useCallback(async () => {
        const res = await triggerLogout({});
        const logoutResponse = res.data?.logout;
        if (logoutResponse) {
            setUser(undefined);
            navigate('login');
            alert.show('Logout Successful', { variant: 'success' });
        }
    }, [navigate, triggerLogout, setUser, alert]);

    return (
        <nav className={styles.navbar}>
            <Link
                to="home"
            >
                <Image
                    className={styles.logo}
                    imgElementClassName={styles.logoImage}
                    src={logo}
                    alt="Nepal Red Cross Society"
                    withoutBackground
                    withoutCaption
                />
            </Link>
            <DropdownMenu
                labelStyleVariant="action"
                labelColorVariant="secondary"
                labelBefore={(
                    <div className={styles.userInitial}>
                        {user?.firstName || user?.lastName.charAt(0) ? (
                            <>
                                {user?.firstName.charAt(0)}
                                {user?.lastName.charAt(0)}
                            </>
                        ) : 'Ad' }
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
                            {user?.userType.toLocaleLowerCase()}
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
