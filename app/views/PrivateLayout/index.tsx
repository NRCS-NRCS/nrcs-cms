import { use } from 'react';
import {
    FaFileAlt,
    FaUserAlt,
} from 'react-icons/fa';
import {
    Navigate,
    Outlet,
} from 'react-router';

import Navbar from '#components/Navbar';
import Navigation from '#components/Navigation';
import Page from '#components/Page';
import UserContext from '#contexts/UserContext';

const navigation = [
    {
        title: 'Content Management',
        icon: <FaFileAlt />,
        variant: 'root' as const,
        children: [
            {
                to: '/blog',
                title: 'Blog',
                variant: 'leaf' as const,
            },
            {
                to: '/departments',
                title: 'Department',
                variant: 'leaf' as const,
            },
            {
                to: '/faqs',
                title: 'FAQs',
                variant: 'leaf' as const,
            },
            {
                to: '/highlights',
                title: 'Highlight',
                variant: 'leaf' as const,

            },
            {
                to: '/news',
                title: 'News',
                variant: 'leaf' as const,

            },
            {
                to: '/partners',
                title: 'Partners',
                variant: 'leaf' as const,

            },
            {
                to: '/procurements',
                title: 'Procurements',
                variant: 'leaf' as const,

            },
            {
                to: '/projects',
                title: 'Projects',
                variant: 'leaf' as const,

            },
            {
                to: '/radio-programs',
                title: 'Radio Programs',
                variant: 'leaf' as const,

            },
            {
                title: 'Strategic',
                variant: 'group' as const,
                children: [
                    {
                        to: '/strategic/major-responsibilities',
                        variant: 'leaf' as const,
                        title: 'Major Responsibilities',
                    },
                    {
                        to: '/strategic/strategic-directive',
                        title: 'Strategic Directives',
                        variant: 'leaf' as const,
                    },
                ],
            },
            {
                to: '/vacancy',
                title: 'Vacancy',
                variant: 'leaf' as const,

            },
        ],
    },
    {
        title: 'User Management',
        icon: <FaUserAlt />,
        variant: 'root' as const,
        children: [
            {
                to: '/users',
                variant: 'leaf' as const,
                title: 'Users',
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
            <Page leftPaneContent={<Navigation navigationItem={navigation} />}>
                <Outlet />
            </Page>

        </>
    );
}

export default PrivateLayout;
