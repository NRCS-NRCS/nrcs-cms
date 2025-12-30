import { use } from 'react';
import {
    Navigate,
    Outlet,
} from 'react-router';

import UserContext from '#contexts/UserContext';

import styles from './styles.module.css';

function GuestLayout() {
    const { authenticated } = use(UserContext);
    if (authenticated) {
        return <Navigate to="/" />;
    }
    return (
        <div className={styles.guestLayout}>
            <Outlet />
        </div>
    );
}

export default GuestLayout;
