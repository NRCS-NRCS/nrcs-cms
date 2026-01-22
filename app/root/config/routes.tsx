type Visibility = 'is-authenticated' | 'is-not-authenticated' | 'is-anything';

export interface RouteConfig {
    index?: boolean;
    path?: string;
    load: () => Promise<{ default: () => React.JSX.Element | null }>;
    visibility: Visibility;
}
const home: RouteConfig = {
    index: true,
    path: '/',
    load: () => import('#views/Home'),
    visibility: 'is-authenticated',
};

const login: RouteConfig = {
    path: '/login/',
    load: () => import('#views/Login'),
    visibility: 'is-not-authenticated',
};

const routes = {
    login,
    home,
};

export type RouteKeys = keyof typeof routes;

export default routes;
