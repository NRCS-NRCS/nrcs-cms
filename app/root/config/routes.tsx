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

const news: RouteConfig = {
    index: true,
    path: 'news',
    load: () => import('#views/News/NewsList'),
    visibility: 'is-authenticated',
};
const editNews: RouteConfig = {
    index: true,
    path: 'news/:id/edit',
    load: () => import('#views/News/NewsForm'),
    visibility: 'is-authenticated',
};

const addNews: RouteConfig = {
    index: true,
    path: 'news/add',
    load: () => import('#views/News/NewsForm'),
    visibility: 'is-authenticated',
};

const procurements: RouteConfig = {
    index: true,
    path: 'procurements',
    load: () => import('#views/Procurement/ProcurementList'),
    visibility: 'is-authenticated',
};

const editProcurements: RouteConfig = {
    index: true,
    path: 'procurements/:id/edit',
    load: () => import('#views/Procurement/ProcurementForm'),
    visibility: 'is-authenticated',
};

const addProcurements: RouteConfig = {
    index: true,
    path: 'procurements/add',
    load: () => import('#views/Procurement/ProcurementForm'),
    visibility: 'is-authenticated',
};

const radioProgram: RouteConfig = {
    index: true,
    path: 'radio-programs',
    load: () => import('#views/RadioProgram/RadioProgramList'),
    visibility: 'is-authenticated',
};

const editRadioProgram: RouteConfig = {
    index: true,
    path: 'radio-programs/:id/edit',
    load: () => import('#views/RadioProgram/RadioProgramForm'),
    visibility: 'is-authenticated',
};

const addRadioProgram: RouteConfig = {
    index: true,
    path: 'radio-programs/add',
    load: () => import('#views/RadioProgram/RadioProgramForm'),
    visibility: 'is-authenticated',
};

const vacancy: RouteConfig = {
    index: true,
    path: 'vacancy',
    load: () => import('#views/Vacancy/VacancyList'),
    visibility: 'is-authenticated',
};

const editVacancy: RouteConfig = {
    index: true,
    path: 'vacancy/:id/edit',
    load: () => import('#views/Vacancy/VacancyForm'),
    visibility: 'is-authenticated',
};

const addVacancy: RouteConfig = {
    index: true,
    path: 'vacancy/add',
    load: () => import('#views/Vacancy/VacancyForm'),
    visibility: 'is-authenticated',
};

const project: RouteConfig = {
    index: true,
    path: 'projects',
    load: () => import('#views/Project/ProjectList'),
    visibility: 'is-authenticated',
};

const editProject: RouteConfig = {
    index: true,
    path: 'projects/:id/edit',
    load: () => import('#views/Project/ProjectForm'),
    visibility: 'is-authenticated',
};

const addProject: RouteConfig = {
    index: true,
    path: 'projects/add',
    load: () => import('#views/Project/ProjectForm'),
    visibility: 'is-authenticated',
};

const strategicDirectives: RouteConfig = {
    index: true,
    path: 'strategic-directive',
    load: () => import('#views/StrategicDirective/StrategicDirectiveList'),
    visibility: 'is-authenticated',
};

const editStrategicDirectives: RouteConfig = {
    index: true,
    path: 'strategic-directive/:id/edit',
    load: () => import('#views/StrategicDirective/StrategicDirectiveForm'),
    visibility: 'is-authenticated',
};

const addStrategicDirectives: RouteConfig = {
    index: true,
    path: 'strategic-directive/add',
    load: () => import('#views/StrategicDirective/StrategicDirectiveForm'),
    visibility: 'is-authenticated',
};

const users: RouteConfig = {
    index: true,
    path: 'users',
    load: () => import('#views/UserManagement/UserList'),
    visibility: 'is-authenticated',
};

const resources: RouteConfig = {
    index: true,
    path: 'resources',
    load: () => import('#views/Resources/ResourcesList'),
    visibility: 'is-authenticated',
};

const editResources: RouteConfig = {
    index: true,
    path: 'resources/:id/edit',
    load: () => import('#views/Resources/ResourcesForm'),
    visibility: 'is-authenticated',
};

const addResources: RouteConfig = {
    index: true,
    path: 'resources/add',
    load: () => import('#views/Resources/ResourcesForm'),
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
    news,
    addNews,
    editNews,
    procurements,
    editProcurements,
    addProcurements,
    radioProgram,
    editRadioProgram,
    addRadioProgram,
    vacancy,
    addVacancy,
    editVacancy,
    project,
    addProject,
    editProject,
    addStrategicDirectives,
    editStrategicDirectives,
    strategicDirectives,
    users,
    resources,
    addResources,
    editResources,
};

export type RouteKeys = keyof typeof routes;

export default routes;
