import {
    generatePath,
    useNavigate,
} from 'react-router';

import routes from '#root/config/routes';

export type RoutesMap = typeof routes;

type ExtractPath<T> = T extends { path: infer P }
  ? (P extends string ? P : '')
  : '';

type PathParams<P extends string> = P extends `${string}:${string}`
  ? [params: Record<string, string | number>]
  : [params?: Record<string, string> | undefined];

function useRouting() {
    const navigate = useNavigate();

    return <K extends keyof RoutesMap>(
        route: K,
        ...args: PathParams<ExtractPath<RoutesMap[K]>>
    ) => {
        const routeConfig = routes[route] as { path?: string };
        const pathTemplate = routeConfig.path ?? '';

        const normalizedTemplate = pathTemplate.startsWith('/')
            ? pathTemplate
            : `/${pathTemplate}`;

        const absolutePath = generatePath(normalizedTemplate, args[0] ?? {});
        navigate(absolutePath);
    };
}

export default useRouting;
