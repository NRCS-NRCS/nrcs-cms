import { use } from 'react';
import {
    FaHighlighter,
    FaMoneyCheck,
    FaProjectDiagram,
    FaRegFileAlt,
    FaRegFileAudio,
    FaRegNewspaper,
    FaRegQuestionCircle,
    FaRegWindowMaximize,
    FaSuitcase,
    FaThinkPeaks,
    FaWarehouse,
} from 'react-icons/fa';
import {
    Navigate,
    Outlet,
} from 'react-router';
import {
    DashboardLineIcon,
    LeadershipIcon,
    ShieldUserLineIcon,
} from '@ifrc-go/icons';

import Navbar from '#components/Navbar';
import Navigation, { NavigationItem } from '#components/Navigation';
import Page from '#components/Page';
import UserContext from '#contexts/UserContext';

const navigationItem : NavigationItem[] = [
    {
        groupTitle: 'User Management',
        routes: [
            {
                title: 'Users',
                to: 'users',
                icon: <ShieldUserLineIcon />,
            },
        ],
    },
    {
        groupTitle: 'Content Management',
        routes: [
            {
                title: 'Dashboard',
                to: 'home',
                icon: <DashboardLineIcon />,
            },
            {
                title: 'Blog',
                to: 'blog',
                icon: <FaRegFileAlt />,
            },
            {
                title: 'Department',
                to: 'department',
                icon: <FaMoneyCheck />,
            },
            {
                title: 'FAQs',
                to: 'faqs',
                icon: <FaRegQuestionCircle />,
            },
            {
                title: 'Highlight',
                to: 'highlight',
                icon: <FaHighlighter />,
            },
            {
                to: 'news',
                title: 'News',
                icon: <FaRegNewspaper />,
            },
            {
                to: 'partner',
                title: 'Partners',
                icon: <LeadershipIcon />,
            },
            {
                to: 'procurements',
                title: 'Procurements',
                icon: <FaRegWindowMaximize />,
            },
            {
                to: 'project',
                title: 'Projects',
                icon: <FaProjectDiagram />,
            },
            {
                to: 'radioProgram',
                title: 'Radio Programs',
                icon: <FaRegFileAudio />,
            },
            {
                to: 'resources',
                title: 'Resources',
                icon: <FaWarehouse />,
            },
            {
                to: 'strategicDirectives',
                title: 'Directives',
                icon: <FaThinkPeaks />,
            },
            {
                to: 'vacancy',
                title: 'Vacancy',
                icon: <FaSuitcase />,
            },

        ],
    },
];
function PrivateLayout() {
    const { authenticated } = use(UserContext);
    if (!authenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <>
            <Navbar />
            <Page leftPaneContent={<Navigation navigationItem={navigationItem} />}>
                <Outlet />
            </Page>

        </>
    );
}

export default PrivateLayout;
