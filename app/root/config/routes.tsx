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

const department: RouteConfig = {
    index: true,
    path: 'departments',
    load: () => import('#views/Department/DepartmentList'),
    visibility: 'is-authenticated',
};
const editDepartment: RouteConfig = {
    index: true,
    path: 'departments/:id/edit',
    load: () => import('#views/Department/DepartmentForm'),
    visibility: 'is-authenticated',
};

const addDepartment: RouteConfig = {
    index: true,
    path: 'departments/add',
    load: () => import('#views/Department/DepartmentForm'),
    visibility: 'is-authenticated',
};

const login: RouteConfig = {
    path: '/login/',
    load: () => import('#views/Login'),
    visibility: 'is-not-authenticated',
};

const faqs: RouteConfig = {
    index: true,
    path: 'faqs',
    load: () => import('#views/FAQs/FAQsList'),
    visibility: 'is-authenticated',
};

const editFaq: RouteConfig = {
    index: true,
    path: 'faqs/:id/edit',
    load: () => import('#views/FAQs/FAQsForm'),
    visibility: 'is-authenticated',
};
const addFaq: RouteConfig = {
    index: true,
    path: 'faqs/add',
    load: () => import('#views/FAQs/FAQsForm'),
    visibility: 'is-authenticated',
};

const highlight: RouteConfig = {
    index: true,
    path: 'highlights',
    load: () => import('#views/Highlight/HighlightList'),
    visibility: 'is-authenticated',
};

const addHighlight: RouteConfig = {
    index: true,
    path: 'highlights/:id/edit',
    load: () => import('#views/Highlight/HighlightForm'),
    visibility: 'is-authenticated',
};

const editHighlight: RouteConfig = {
    index: true,
    path: 'highlights/add',
    load: () => import('#views/Highlight/HighlightForm'),
    visibility: 'is-authenticated',
};
const partner: RouteConfig = {
    index: true,
    path: 'partners',
    load: () => import('#views/Partner/PartnerList'),
    visibility: 'is-authenticated',
};
const editPartner: RouteConfig = {
    index: true,
    path: 'partners/:id/edit',
    load: () => import('#views/Partner/PartnerForm'),
    visibility: 'is-authenticated',
};

const addPartner: RouteConfig = {
    index: true,
    path: 'partners/add',
    load: () => import('#views/Partner/PartnerForm'),
    visibility: 'is-authenticated',
};
const routes = {
    login,
    home,
    blog,
    addBlog,
    editBlog,
    department,
    addDepartment,
    editDepartment,
    faqs,
    addFaq,
    editFaq,
    highlight,
    addHighlight,
    editHighlight,
    partner,
    editPartner,
    addPartner,
};

export type RouteKeys = keyof typeof routes;

export default routes;
