import {
    type ReactElement,
    use,
    useCallback,
} from 'react';
import {
    FaFileAlt,
    FaFileAudio,
    FaHighlighter,
    FaMoneyCheck,
    FaProjectDiagram,
    FaQuestionCircle,
    FaRegNewspaper,
    FaSuitcase,
    FaThinkPeaks,
    FaUserFriends,
    FaWarehouse,
    FaWindowMaximize,
} from 'react-icons/fa';
import {
    Button,
    Container,
    Heading,
    ListView,
} from '@ifrc-go/ui';

import UserContext from '#contexts/UserContext';
import { useCountsQuery } from '#generated/types/graphql';
import useRouting, { type RoutesMap } from '#hooks/useRouting';

import styles from './styles.module.css';

interface CardItem {
    title: string;
    count: number;
    icon: ReactElement;
    redirect: keyof RoutesMap ;
}

function Dashboards() {
    const { user } = use(UserContext);
    const [{ data }] = useCountsQuery();
    const navigate = useRouting();

    const card : CardItem[] = [
        {
            title: 'Blogs',
            count: data?.blogs.totalCount || 0,
            icon: <FaFileAlt />,
            redirect: 'addBlog',
        },
        {
            title: 'Departments',
            count: data?.departments.totalCount || 0,
            icon: <FaMoneyCheck />,
            redirect: 'addDepartment',
        },
        {
            title: 'FAQs',
            count: data?.faqs.totalCount || 0,
            icon: <FaQuestionCircle />,
            redirect: 'addFaq',
        },
        {
            title: 'Highlights',
            count: data?.highlightedBlogs.totalCount || 0,
            icon: <FaHighlighter />,
            redirect: 'addNews',
        },
        {
            title: 'Vacancies',
            count: data?.jobVacancies.totalCount || 0,
            icon: <FaSuitcase />,
            redirect: 'addVacancy',
        },
        {
            title: 'News',
            count: data?.news.totalCount || 0,
            icon: <FaRegNewspaper />,
            redirect: 'addNews',
        },
        {
            title: 'Partners',
            count: data?.partners.totalCount || 0,
            icon: <FaUserFriends />,
            redirect: 'addPartner',
        },
        {
            title: 'Radio Programs',
            count: data?.radioProgram.totalCount || 0,
            icon: <FaFileAudio />,
            redirect: 'addRadioProgram',
        },
        {
            title: 'Strategic Directives',
            count: data?.strategicDirectives.totalCount || 0,
            icon: <FaThinkPeaks />,
            redirect: 'addStrategicDirectives',
        },
        {
            title: 'Resources',
            count: data?.resources.totalCount || 0,
            icon: <FaWarehouse />,
            redirect: 'addResources',
        },
        {
            title: 'Projects',
            count: data?.projects.totalCount || 0,
            icon: <FaProjectDiagram />,
            redirect: 'addProject',
        },
        {
            title: 'Procurements',
            count: data?.procurements.totalCount || 0,
            icon: <FaWindowMaximize />,
            redirect: 'addProcurements',
        },
    ];

    const handleNavigate = useCallback(
        (redirect:keyof RoutesMap) => navigate(redirect),
        [navigate],
    );

    return (
        <Container
            className={styles.container}
            heading="Dashboards"
            headingLevel={1}
            headerDescription={(
                <>
                    Welcome back
                    {' '}
                    <strong>
                        {user?.firstName}
                        {' '}
                        {user?.lastName}
                    </strong>
                    {' '}
                    to the NRCS CMS Dashboard.
                    <br />
                    Use the navigation menu to access different sections of the CMS.
                </>
            )}
        >
            <div className={styles.content}>
                <ListView
                    layout="grid"
                    withFullWidth
                    numPreferredGridColumns={3}
                >
                    {card.map((item) => (
                        <ListView key={item.title} withPadding withBackground layout="block">
                            <Heading level={6}>
                                {item.title}
                            </Heading>
                            <ListView spacing="sm">
                                {item.icon}
                                {item.count}
                            </ListView>
                        </ListView>
                    ))}
                </ListView>
                <ListView
                    withPadding
                    withBackground
                    layout="block"
                    spacing="sm"
                >
                    <Heading level={3}>Quick Action</Heading>
                    {card.map((item) => (
                        <div key={item.title}>
                            <Button
                                name={item.redirect}
                                styleVariant="outline"
                                textSize="sm"
                                onClick={handleNavigate}
                            >
                                New
                                {' '}
                                {item.title}
                            </Button>
                        </div>
                    ))}
                </ListView>
            </div>
        </Container>
    );
}

export default Dashboards;
