import { useMemo } from 'react';
import {
    matchPath,
    useLocation,
    useParams,
} from 'react-router';
import {
    BlockView,
    Breadcrumbs as BaseBreadcrumbs,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import type { RouteKeys } from '#root/config/routes';
import routes from '#root/config/routes';

const routeList = (Object.entries(routes) as [RouteKeys, typeof routes[RouteKeys]][])
    .map(([routeKey, { path, label }]) => (
        isDefined(path) ? { routeKey, path, label } : undefined
    ))
    .filter(isDefined);

const staticSegments = new Set(
    routeList
        .flatMap(({ path }) => path.split('/'))
        .filter((segment) => segment !== '' && !segment.startsWith(':')),
);

interface Crumb {
    label: string;
    routeKey: RouteKeys | undefined;
}

export interface Props {
    className?: string;
}

function Breadcrumbs(props: Props) {
    const { className } = props;

    const { pathname } = useLocation();
    const params = useParams();

    const crumbs = useMemo(
        () => {
            const segments = pathname.split('/').filter(Boolean);

            return segments.reduce<Crumb[]>(
                (acc, segment, index) => {
                    if (!staticSegments.has(segment)) {
                        return acc;
                    }

                    const to = `/${segments.slice(0, index + 1).join('/')}`;
                    const route = routeList.find(({ path }) => matchPath(path, to));

                    acc.push({
                        label: route?.label || segment,
                        routeKey: route?.routeKey,
                    });

                    return acc;
                },
                [{ label: routes.home.label, routeKey: 'home' }],
            );
        },
        [pathname],
    );

    if (crumbs.length <= 1) {
        return null;
    }

    return (
        <BlockView withPadding>
            <BaseBreadcrumbs className={className}>
                {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1;

                    if (isLast || !isDefined(crumb.routeKey)) {
                        return (
                            <span key={crumb.label}>
                                {crumb.label}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={crumb.label}
                            to={crumb.routeKey}
                            attrs={params}
                        >
                            {crumb.label}
                        </Link>
                    );
                })}
            </BaseBreadcrumbs>
        </BlockView>
    );
}

export default Breadcrumbs;
