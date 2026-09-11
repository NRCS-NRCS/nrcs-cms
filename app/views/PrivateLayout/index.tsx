import {
    use,
    useCallback,
    useMemo,
    useState,
} from 'react';
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
import { _cs } from '@togglecorp/fujs';

import Breadcrumbs from '#components/Breadcrumbs';
import Navbar from '#components/Navbar';
import Navigation, { type NavigationItem } from '#components/Navigation';
import Page from '#components/Page';
import UserContext from '#contexts/UserContext';
import usePermissions from '#hooks/usePermissions';
import { type RouteKeys } from '#root/config/routes';

import styles from './styles.module.css';

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
    const { canEditUsers } = usePermissions();

    const [navShown, setNavShown] = useState(false);

    // NOTE: The route guards already turn people away, but an entry that only
    // ever bounces you is worse than no entry, so the nav is filtered too.
    const visibleNavigationItems = useMemo(
        () => {
            const permissionByRoute: Partial<Record<RouteKeys, boolean>> = {
                users: canEditUsers,
            };

            return navigationItem
                .map((group) => ({
                    ...group,
                    routes: group.routes.filter(
                        (route) => permissionByRoute[route.to] ?? true,
                    ),
                }))
                .filter((group) => group.routes.length > 0);
        },
        [canEditUsers],
    );

    const handleMenuButtonClick = useCallback(() => {
        setNavShown((oldValue) => !oldValue);
    }, []);

    // The drawer overlays the content, so close it once a route is selected
    const handleNavigate = useCallback(() => {
        setNavShown(false);
    }, []);

    if (!authenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <>
            <Navbar
                menuShown={navShown}
                onMenuButtonClick={handleMenuButtonClick}
            />
            <Page
                leftPaneContent={(
                    <Navigation
                        navigationItem={visibleNavigationItems}
                        onNavigate={handleNavigate}
                    />
                )}
                leftPaneContainerClassName={_cs(
                    styles.navContainer,
                    navShown && styles.navShown,
                )}
                topContent={<Breadcrumbs />}
            >
                <Outlet />
            </Page>

        </>
    );
}

export default PrivateLayout;
