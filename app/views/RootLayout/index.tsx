import {
    use,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { Outlet } from 'react-router';
import {
    Button,
    ListView,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';
import { api } from 'app/config';
import { gql } from 'urql';

import PreloadMessage from '#components/PreloadMessage';
import UserContext from '#contexts/UserContext';
import { useMeQuery } from '#generated/types/graphql';

import styles from './styles.module.css';

const HEALTH_CHECK_ENDPOINT = `${api}/health-check/?format=json`;

type HealthState = 'pending' | 'reachable' | 'unreachable';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ME_QUERY = gql`
    query Me {
        me {
            userType
            lastLogin
            isActive
            id
            firstName
            lastName
            email
            createdAt
        }
    }
`;

function RootLayout() {
    const { setUser } = use(UserContext);
    const [ready, setReady] = useState(false);
    const [health, setHealth] = useState<HealthState>('pending');
    // NOTE: Bumping this re-runs the health check. The check used to be a
    // promise created at module scope, which meant a server that was down at
    // load time could only be recovered from by reloading the whole page.
    const [healthAttempt, setHealthAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHealth('pending');

        fetch(HEALTH_CHECK_ENDPOINT, {
            method: 'GET',
            credentials: 'include',
        }).then((response) => {
            if (!response.ok) {
                throw new Error(`Health check responded with ${response.status}`);
            }
            return response.json();
        }).then(() => {
            if (!cancelled) {
                setHealth('reachable');
            }
        }).catch(() => {
            if (!cancelled) {
                setHealth('unreachable');
            }
        });

        return () => {
            cancelled = true;
        };
    }, [healthAttempt]);

    const reachable = health === 'reachable';

    const [{ fetching, data }] = useMeQuery({
        pause: !reachable,
    });

    useEffect(() => {
        if (!reachable || fetching) {
            return;
        }
        if (isDefined(data?.me)) {
            setUser(data.me);
        } else {
            setUser(undefined);
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReady(true);
    }, [reachable, fetching, data, setUser]);

    const handleRetryClick = useCallback(() => {
        setHealthAttempt((oldValue) => oldValue + 1);
    }, []);

    if (health === 'unreachable') {
        return (
            <PreloadMessage>
                <ListView
                    layout="block"
                    withCenteredContents
                    spacing="sm"
                >
                    <div>
                        We could not reach the server.
                    </div>
                    <div>
                        Check your connection and try again.
                    </div>
                    <Button
                        name={undefined}
                        onClick={handleRetryClick}
                        styleVariant="filled"
                    >
                        Try again
                    </Button>
                </ListView>
            </PreloadMessage>
        );
    }

    if (!ready) {
        return (
            <PreloadMessage>
                Checking user session...
            </PreloadMessage>
        );
    }

    return (
        <div className={styles.root}>
            <Outlet />
        </div>
    );
}

export default RootLayout;
