import {
    Suspense,
    use,
    useEffect,
    useState,
} from 'react';
import { Outlet } from 'react-router';
import { isDefined } from '@togglecorp/fujs';
import { gql } from 'urql';

import PreloadMessage from '#components/PreloadMessage';
import UserContext from '#contexts/UserContext';
import { useMeQuery } from '#generated/types/graphql';

import styles from './styles.module.css';

const fetchHealth = fetch(`${import.meta.env.APP_GRAPHQL_ENDPOINT}/health-check/?format=json`, {
    method: 'GET',
    credentials: 'include',
})
    .then((res) => res.json());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ME_QUERY = gql`
query Me {
    me {
         email
        firstName
        id
        lastName
    }
}
`;

function RootLayout() {
    const { setUser } = use(UserContext);
    const [ready, setReady] = useState(false);

    const healthCheck = use(fetchHealth);

    const [{ fetching, data }] = useMeQuery({
        pause: !healthCheck,
    });

    useEffect(() => {
        if (!healthCheck || fetching) {
            return;
        }
        if (isDefined(data?.me)) {
            setUser(data.me);
        } else {
            setUser(undefined);
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReady(true);
    }, [healthCheck, fetching, data, setUser]);

    if (!ready) {
        return (
            <PreloadMessage>
                Checking user session...
            </PreloadMessage>
        );
    }
    return (
        <Suspense>
            <div className={styles.root}>
                <Outlet />
            </div>
        </Suspense>
    );
}

export default RootLayout;
