import {
    Suspense,
    useCallback,
    useMemo,
    useState,
} from 'react';
import { Cookies } from 'react-cookie';
import { Outlet } from 'react-router';
import { AlertContainer } from '@ifrc-go/ui';
import { AlertContext } from '@ifrc-go/ui/contexts';
import { cacheExchange } from '@urql/exchange-graphcache';
import {
    api,
    appTitle,
    environment,
} from 'app/config';
import {
    Client,
    fetchExchange,
    Provider as UrqlProvider,
} from 'urql';

import PreloadMessage from '#components/PreloadMessage';
import UserContext, { type UserContextInterface } from '#contexts/UserContext';
import useAlertContextProviderValue from '#hooks/useAlertContextProviderValue';

import type { User } from './types/user';

const COOKIE_NAME = `NRCS-${environment}-CSRFTOKEN`;
const GRAPHQL_ENDPOINT = `${api}/graphql/`;

const cookies = new Cookies();

function createGqlClient() {
    return new Client({
        url: GRAPHQL_ENDPOINT,
        exchanges: [
            cacheExchange({
                keys: {
                    OffsetPaginationInfo: () => null,
                    BlogTypeOffsetPaginated: () => null,
                    DepartmentTypeOffsetPaginated: () => null,
                    FaqTypeOffsetPaginated: () => null,
                    StrategicDirectivesTypeOffsetPaginated: () => null,
                    HighlightTypeOffsetPaginated: () => null,
                    ProcurementTypeOffsetPaginated: () => null,
                    NewsTypeOffsetPaginated: () => null,
                    ProjectTypeOffsetPaginated: () => null,
                    PartnerTypeOffsetPaginated: () => null,
                    RadioProgramTypeOffsetPaginated: () => null,
                    VacancyTypeOffsetPaginated: () => null,
                    DjangoFileType: () => null,
                    ResourceTypeOffsetPaginated: () => null,
                    UserTypeOffsetPaginated: () => null,
                    JobVacancyTypeOffsetPaginated: () => null,
                    MajorResponsibilitiesTypeOffsetPaginated: () => null,

                },
            }),
            fetchExchange,
        ],
        fetchOptions: () => ({
            headers: {
                'X-CSRFToken': cookies.get(COOKIE_NAME),
            },
            credentials: 'include',
        }),
        requestPolicy: 'cache-and-network',
        suspense: false,
    });
}

function Root() {
    const [user, setUser] = useState<User | undefined>();
    const [gqlClient, setGqlClient] = useState(createGqlClient);
    const authenticated = !!user;

    const resetClient = useCallback(
        () => {
            setGqlClient(createGqlClient());
        },
        [],
    );

    const userContext: UserContextInterface = useMemo(
        () => ({
            authenticated,
            user,
            setUser,
            resetClient,
        }),
        [
            authenticated,
            user,
            setUser,
            resetClient,
        ],
    );
    const alertContextValue = useAlertContextProviderValue();

    return (
        <UrqlProvider value={gqlClient}>
            <UserContext.Provider value={userContext}>
                <AlertContext.Provider value={alertContextValue}>
                    <AlertContainer />
                    <Suspense
                        fallback={(
                            <PreloadMessage>
                                {appTitle}
                                {' '}
                                loading...
                            </PreloadMessage>
                        )}
                    >
                        <Outlet />
                    </Suspense>
                </AlertContext.Provider>
            </UserContext.Provider>
        </UrqlProvider>
    );
}

export default Root;
