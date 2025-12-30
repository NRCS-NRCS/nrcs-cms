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

function PrivateLayout() {
    const { authenticated } = use(UserContext);
    if (!authenticated) {
        return <Navigate to="/login" />;
    }

    const navigation = [
        {
            title: 'Content Management',
            icon: <FaFileAlt />,
            variant: 'root' as const,
            children: [
                {
                    to: '/cm/blog',
                    title: 'Blog',
                    variant: 'leaf' as const,
                },
                {
                    to: '/cm/departments',
                    title: 'Department',
                    variant: 'leaf' as const,
                },
                {
                    to: '/cm/faqs',
                    title: 'FAQs',
                    variant: 'leaf' as const,
                },
                {
                    to: '/home',
                    title: 'Home',
                    variant: 'leaf' as const,

                },
                {
                    to: '/cm/news',
                    title: 'News',
                    variant: 'leaf' as const,

                },
                {
                    to: '/cm/partners',
                    title: 'Partners',
                    variant: 'leaf' as const,

                },
                {
                    to: '/cm/procurements',
                    title: 'Procurements',
                    variant: 'leaf' as const,

                },
                {
                    to: '/cm/radio-programs',
                    title: 'Radio Programs',
                    variant: 'leaf' as const,

                },
                {
                    title: 'Strategic',
                    variant: 'group' as const,
                    children: [
                        {
                            to: '/about/strategic/major-responsibilities',
                            variant: 'leaf' as const,
                            title: 'Major Responsibilities',
                        },
                        { to: '/about/strategic/goal', title: 'Goal', variant: 'leaf' as const },
                    ],
                },
                {
                    to: '/cm/vacancy',
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
                    to: '/user/emergency-needs-assessment',
                    variant: 'leaf' as const,
                    title: 'Emergency Needs Assessment',
                },
            ],
        },
    ];
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
