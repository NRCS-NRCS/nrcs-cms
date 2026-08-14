import { use } from 'react';
import { generatePath } from 'react-router';

import UserContext from '#contexts/UserContext';
import type { RouteKeys } from '#root/config/routes';
import routes from '#root/config/routes';

export interface Attrs {
    [key: string]: string | undefined;
}

export function resolveRoute(routeKey: RouteKeys, authenticated: boolean, attrs?: Attrs) {
    const to = routes[routeKey];

    if (!to) {
        return undefined;
    }

    const {
        visibility,
        path,
    } = to;

    if (visibility === 'is-not-authenticated' && authenticated) {
        return undefined;
    }

    if (visibility === 'is-authenticated' && !authenticated) {
        return undefined;
    }

    return {
        to: generatePath(path ?? '/', { ...attrs }),
    };
}

function useRouteMatching(routeKey: RouteKeys, attrs?: Attrs) {
    const { authenticated } = use(UserContext);

    return resolveRoute(routeKey, authenticated, attrs);
}

export default useRouteMatching;
