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

const blog: RouteConfig = {
    index: true,
    path: 'blog',
    load: () => import('#views/Blog/BlogList'),
    visibility: 'is-authenticated',
};
const editBlog: RouteConfig = {
    index: true,
    path: 'blog/:id/edit',
    load: () => import('#views/Blog/BlogForm'),
    visibility: 'is-authenticated',
};

const addBlog: RouteConfig = {
    index: true,
    path: 'blog/add',
    load: () => import('#views/Blog/BlogForm'),
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
    blog,
    addBlog,
    editBlog,
};

export type RouteKeys = keyof typeof routes;

export default routes;
