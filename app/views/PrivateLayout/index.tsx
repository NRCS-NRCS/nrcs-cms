import { use } from 'react';
import {
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
    UploadCloudLineIcon,
} from '@ifrc-go/icons';

import Breadcrumbs from '#components/Breadcrumbs';
import Navbar from '#components/Navbar';
import Navigation, { type NavigationItem } from '#components/Navigation';
import Page from '#components/Page';
import UserContext from '#contexts/UserContext';

const navigationItem : NavigationItem[] = [
    {
        groupTitle: 'Site',
        routes: [
            {
                to: 'deployments',
                icon: <UploadCloudLineIcon />,
            },
        ],
    },
    {
        groupTitle: 'User Management',
        routes: [
            {
                to: 'users',
                icon: <ShieldUserLineIcon />,
            },
        ],
    },
    {
        groupTitle: 'Content Management',
        routes: [
            {
                to: 'home',
                icon: <DashboardLineIcon />,
            },
            {
                to: 'blog',
                icon: <FaRegFileAlt />,
            },
            {
                to: 'department',
                icon: <FaMoneyCheck />,
            },
            {
                to: 'faqs',
                icon: <FaRegQuestionCircle />,
            },
            {
                to: 'news',
                icon: <FaRegNewspaper />,
            },
            {
                to: 'partner',
                icon: <LeadershipIcon />,
            },
            {
                to: 'procurements',
                icon: <FaRegWindowMaximize />,
            },
            {
                to: 'project',
                icon: <FaProjectDiagram />,
            },
            {
                to: 'radioProgram',
                icon: <FaRegFileAudio />,
            },
            {
                to: 'resources',
                icon: <FaWarehouse />,
            },
            {
                to: 'strategicDirectives',
                icon: <FaThinkPeaks />,
            },
            {
                to: 'vacancy',
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
            <Page
                leftPaneContent={(
                    <Navigation
                        navigationItem={navigationItem}
                    />
                )}
                topContent={<Breadcrumbs />}
            >
                <Outlet />
            </Page>

        </>
    );
}

export default PrivateLayout;
