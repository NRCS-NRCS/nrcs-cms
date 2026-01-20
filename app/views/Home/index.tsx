import { use } from 'react';
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
import { useNavigate } from 'react-router';
import {
    Button,
    Container,
    Heading,
} from '@ifrc-go/ui';

import Page from '#components/Page';
import UserContext from '#contexts/UserContext';
import { useCountsQuery } from '#generated/types/graphql';

import styles from './styles.module.css';

function Dashboards() {
    const { user } = use(UserContext);
    const [{ data }] = useCountsQuery();
    const navigate = useNavigate();

    const card = [
        {
            title: 'Featured blogs',
            count: data?.blogs.totalCount || 0,
            icon: <FaFileAlt />,
            addLink: '/blog/add',
        },
        {
            title: 'Departments',
            count: data?.departments.totalCount || 0,
            icon: <FaMoneyCheck />,
            addLink: '/departments/add',

        },
        {
            title: 'FAQs',
            count: data?.faqs.totalCount || 0,
            icon: <FaQuestionCircle />,
            addLink: '/faqs/add',
        },
        {
            title: 'Highlights',
            count: data?.highlights.totalCount || 0,
            icon: <FaHighlighter />,
            addLink: '/highlights/add',
        },
        {
            title: 'Vacancies',
            count: data?.jobVacancies.totalCount || 0,
            icon: <FaSuitcase />,
            addLink: '/job-vacancies/add',
        },
        {
            title: 'News',
            count: data?.news.totalCount || 0,
            icon: <FaRegNewspaper />,
            addLink: '/news/add',
        },
        {
            title: 'Partners',
            count: data?.partners.totalCount || 0,
            icon: <FaUserFriends />,
            addLink: '/partners/add',
        },
        {
            title: 'Radio Programs',
            count: data?.radioProgram.totalCount || 0,
            icon: <FaFileAudio />,
            addLink: '/radio-programs/add',
        },
        {
            title: 'Strategic Directives',
            count: data?.strategicDirectives.totalCount || 0,
            icon: <FaThinkPeaks />,
            addLink: '/strategic-directives/add',
        },
        {
            title: 'Resources',
            count: data?.resources.totalCount || 0,
            icon: <FaWarehouse />,
            addLink: '/resources/add',
        },
        {
            title: 'Projects',
            count: data?.projects.totalCount || 0,
            icon: <FaProjectDiagram />,
            addLink: '/projects/add',
        },
        {
            title: 'Procurements',
            count: data?.procurements.totalCount || 0,
            icon: <FaWindowMaximize />,
            addLink: '/procurements/add',
        },
    ];

    return (
        <Page className={styles.page}>
            <Container
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
                        to the NRC CMS Dashboard.
                        <br />
                        Use the navigation menu to access different sections of the CMS.
                    </>
                )}
                childrenContainerClassName={styles.childContainer}
                className={styles.container}
            >
                <div className={styles.content}>
                    <div className={styles.cards}>
                        {card.map((item) => (
                            <div key={item.title} className={styles.card}>
                                <Heading level={6}>
                                    {item.title}
                                </Heading>
                                <div className={styles.cardCount}>
                                    {item.icon}
                                    {item.count}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.cards}>
                        <div className={styles.card}>
                            <Heading level={3}>Quick Action</Heading>
                            {card.map((item) => (
                                <div key={item.title}>
                                    <Button variant="secondary" name={undefined} onClick={() => navigate(item.addLink)}>
                                        New
                                        {' '}
                                        {item.title}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </Container>
        </Page>
    );
}

export default Dashboards;
