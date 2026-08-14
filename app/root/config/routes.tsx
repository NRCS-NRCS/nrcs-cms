type Visibility = 'is-authenticated' | 'is-not-authenticated' | 'is-anything';

export interface RouteConfig {
    index?: boolean;
    path?: string;
    label: string;
    load: () => Promise<{ default: () => React.JSX.Element | null }>;
    visibility: Visibility;
}
const home: RouteConfig = {
    index: true,
    path: '/',
    label: 'Home',
    load: () => import('#views/Home'),
    visibility: 'is-authenticated',
};

const blog: RouteConfig = {
    index: true,
    path: 'blog',
    label: 'Blog',
    load: () => import('#views/Blog/BlogList'),
    visibility: 'is-authenticated',
};
const editBlog: RouteConfig = {
    index: true,
    path: 'blog/:id/edit',
    label: 'Edit Blog',
    load: () => import('#views/Blog/BlogForm'),
    visibility: 'is-authenticated',
};

const addBlog: RouteConfig = {
    index: true,
    path: 'blog/add',
    label: 'Create Blog',
    load: () => import('#views/Blog/BlogForm'),
    visibility: 'is-authenticated',
};

const department: RouteConfig = {
    index: true,
    path: 'departments',
    label: 'Department',
    load: () => import('#views/Department/DepartmentList'),
    visibility: 'is-authenticated',
};
const editDepartment: RouteConfig = {
    index: true,
    path: 'departments/:id/edit',
    label: 'Edit Department',
    load: () => import('#views/Department/DepartmentForm'),
    visibility: 'is-authenticated',
};

const addDepartment: RouteConfig = {
    index: true,
    path: 'departments/add',
    label: 'Create Department',
    load: () => import('#views/Department/DepartmentForm'),
    visibility: 'is-authenticated',
};

const login: RouteConfig = {
    path: '/login/',
    label: 'Login',
    load: () => import('#views/Login'),
    visibility: 'is-not-authenticated',
};

const faqs: RouteConfig = {
    index: true,
    path: 'faqs',
    label: 'FAQs',
    load: () => import('#views/FAQs/FAQsList'),
    visibility: 'is-authenticated',
};

const editFaq: RouteConfig = {
    index: true,
    path: 'faqs/:id/edit',
    label: 'Edit FAQ',
    load: () => import('#views/FAQs/FAQsForm'),
    visibility: 'is-authenticated',
};
const addFaq: RouteConfig = {
    index: true,
    path: 'faqs/add',
    label: 'Create FAQ',
    load: () => import('#views/FAQs/FAQsForm'),
    visibility: 'is-authenticated',
};

const partner: RouteConfig = {
    index: true,
    path: 'partners',
    label: 'Partners',
    load: () => import('#views/Partner/PartnerList'),
    visibility: 'is-authenticated',
};
const editPartner: RouteConfig = {
    index: true,
    path: 'partners/:id/edit',
    label: 'Edit Partner',
    load: () => import('#views/Partner/PartnerForm'),
    visibility: 'is-authenticated',
};

const addPartner: RouteConfig = {
    index: true,
    path: 'partners/add',
    label: 'Create Partner',
    load: () => import('#views/Partner/PartnerForm'),
    visibility: 'is-authenticated',
};

const news: RouteConfig = {
    index: true,
    path: 'news',
    label: 'News',
    load: () => import('#views/News/NewsList'),
    visibility: 'is-authenticated',
};
const editNews: RouteConfig = {
    index: true,
    path: 'news/:id/edit',
    label: 'Edit News',
    load: () => import('#views/News/NewsForm'),
    visibility: 'is-authenticated',
};

const addNews: RouteConfig = {
    index: true,
    path: 'news/add',
    label: 'Create News',
    load: () => import('#views/News/NewsForm'),
    visibility: 'is-authenticated',
};

const procurements: RouteConfig = {
    index: true,
    path: 'procurements',
    label: 'Procurements',
    load: () => import('#views/Procurement/ProcurementList'),
    visibility: 'is-authenticated',
};

const editProcurements: RouteConfig = {
    index: true,
    path: 'procurements/:id/edit',
    label: 'Edit Procurement',
    load: () => import('#views/Procurement/ProcurementForm'),
    visibility: 'is-authenticated',
};

const addProcurements: RouteConfig = {
    index: true,
    path: 'procurements/add',
    label: 'Create Procurement',
    load: () => import('#views/Procurement/ProcurementForm'),
    visibility: 'is-authenticated',
};

const radioProgram: RouteConfig = {
    index: true,
    path: 'radio-programs',
    label: 'Radio Programs',
    load: () => import('#views/RadioProgram/RadioProgramList'),
    visibility: 'is-authenticated',
};

const editRadioProgram: RouteConfig = {
    index: true,
    path: 'radio-programs/:id/edit',
    label: 'Edit Radio Program',
    load: () => import('#views/RadioProgram/RadioProgramForm'),
    visibility: 'is-authenticated',
};

const addRadioProgram: RouteConfig = {
    index: true,
    path: 'radio-programs/add',
    label: 'Create Radio Program',
    load: () => import('#views/RadioProgram/RadioProgramForm'),
    visibility: 'is-authenticated',
};

const vacancy: RouteConfig = {
    index: true,
    path: 'vacancy',
    label: 'Vacancy',
    load: () => import('#views/Vacancy/VacancyList'),
    visibility: 'is-authenticated',
};

const editVacancy: RouteConfig = {
    index: true,
    path: 'vacancy/:id/edit',
    label: 'Edit Vacancy',
    load: () => import('#views/Vacancy/VacancyForm'),
    visibility: 'is-authenticated',
};

const addVacancy: RouteConfig = {
    index: true,
    path: 'vacancy/add',
    label: 'Create Vacancy',
    load: () => import('#views/Vacancy/VacancyForm'),
    visibility: 'is-authenticated',
};

const project: RouteConfig = {
    index: true,
    path: 'projects',
    label: 'Projects',
    load: () => import('#views/Project/ProjectList'),
    visibility: 'is-authenticated',
};

const editProject: RouteConfig = {
    index: true,
    path: 'projects/:id/edit',
    label: 'Edit Project',
    load: () => import('#views/Project/ProjectForm'),
    visibility: 'is-authenticated',
};

const addProject: RouteConfig = {
    index: true,
    path: 'projects/add',
    label: 'Create Project',
    load: () => import('#views/Project/ProjectForm'),
    visibility: 'is-authenticated',
};

const strategicDirectives: RouteConfig = {
    index: true,
    path: 'strategic-directive',
    label: 'Directives',
    load: () => import('#views/StrategicDirective/StrategicDirectiveList'),
    visibility: 'is-authenticated',
};

const editStrategicDirectives: RouteConfig = {
    index: true,
    path: 'strategic-directive/:id/edit',
    label: 'Edit Directive',
    load: () => import('#views/StrategicDirective/StrategicDirectiveForm'),
    visibility: 'is-authenticated',
};

const addStrategicDirectives: RouteConfig = {
    index: true,
    path: 'strategic-directive/add',
    label: 'Create Directive',
    load: () => import('#views/StrategicDirective/StrategicDirectiveForm'),
    visibility: 'is-authenticated',
};

const users: RouteConfig = {
    index: true,
    path: 'users',
    label: 'Users',
    load: () => import('#views/UserManagement/UserList'),
    visibility: 'is-authenticated',
};

const addUser: RouteConfig = {
    index: true,
    path: 'users/add',
    label: 'Create User',
    load: () => import('#views/UserManagement/UserForm'),
    visibility: 'is-authenticated',
};
const editUser: RouteConfig = {
    index: true,
    path: 'users/:id/edit',
    label: 'Edit User',
    load: () => import('#views/UserManagement/UserForm'),
    visibility: 'is-authenticated',
};

const resources: RouteConfig = {
    index: true,
    path: 'resources',
    label: 'Resources',
    load: () => import('#views/Resources/ResourcesList'),
    visibility: 'is-authenticated',
};

const editResources: RouteConfig = {
    index: true,
    path: 'resources/:id/edit',
    label: 'Edit Resource',
    load: () => import('#views/Resources/ResourcesForm'),
    visibility: 'is-authenticated',
};

const addResources: RouteConfig = {
    index: true,
    path: 'resources/add',
    label: 'Create Resource',
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
    addUser,
    editUser,
    resources,
    addResources,
    editResources,
};

export type RouteKeys = keyof typeof routes;

export default routes;
