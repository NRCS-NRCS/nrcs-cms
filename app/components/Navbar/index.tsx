import React, {
    use,
    useCallback,
    useMemo,
} from 'react';
import {
    CloseLineIcon,
    MenuLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    DropdownMenu,
    Heading,
    IconButton,
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

interface Props {
    menuShown?: boolean;
    onMenuButtonClick?: () => void;
}

function Navbar(props: Props) {
    const {
        menuShown,
        onMenuButtonClick,
    } = props;

    const { user, setUser, resetClient } = use(UserContext);
    const alert = useAlert();
    const navigate = useRouting();

    const [{ fetching: pendingLogout }, triggerLogout] = useLogoutMutation();

    const userInitials = useMemo(
        () => {
            const initials = [user?.firstName, user?.lastName]
                .map((part) => part?.trim().charAt(0) ?? '')
                .join('')
                .toUpperCase();
            return initials || '?';
        },
        [user?.firstName, user?.lastName],
    );

    const handleLogout = useCallback(async () => {
        const res = await triggerLogout({});
        if (res.error || !res.data?.logout) {
            alert.show(
                'Could not log you out. Please try again.',
                { variant: 'danger' },
            );
            return;
        }
        setUser(undefined);
        resetClient();
        navigate('login');
        alert.show('Logout Successful', { variant: 'success' });
    }, [navigate, triggerLogout, setUser, resetClient, alert]);

    return (
        <nav className={styles.navbar}>
            {onMenuButtonClick && (
                <div className={styles.menuButton}>
                    <IconButton
                        name={undefined}
                        onClick={onMenuButtonClick}
                        title={menuShown ? 'Close menu' : 'Open menu'}
                        ariaLabel={menuShown ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuShown}
                        variant="tertiary"
                    >
                        {menuShown ? <CloseLineIcon /> : <MenuLineIcon />}
                    </IconButton>
                </div>
            )}
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
                        {userInitials}
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
