import '@ifrc-go/ui/index.css';
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router';

import routes, { type RouteConfig } from './root/config/routes.tsx';
import PageError from './views/PageError/index.tsx';

const privateRoutes = Object.values(routes).filter(
    ({ visibility }) => visibility === 'is-authenticated',
);

const publicRoutes = Object.values(routes).filter(
    ({ visibility }) => visibility === 'is-anything',
);

const guestRoutes = Object.values(routes).filter(
    ({ visibility }) => visibility === 'is-not-authenticated',
);

function mapRoute(routeConfig: RouteConfig) {
    return {
        index: routeConfig.index,
        path: routeConfig.path,
        lazy: async () => {
            const { default: Component } = await routeConfig.load();
            return { Component };
        },
    };
}

const router = createBrowserRouter([{
    errorElement: <PageError />,
    lazy: async () => {
        const { default: Component } = await import('./root/index.tsx');
        return { Component };
    },
    children: [
        {
            lazy: async () => {
                const { default: Component } = await import('./views/RootLayout/index.tsx');
                return { Component };
            },
            children: [{
                lazy: async () => {
                    const { default: Component } = await import('./views/GuestLayout/index.tsx');
                    return { Component };
                },
                children: guestRoutes.map(mapRoute),
            },
            {
                lazy: async () => {
                    const { default: Component } = await import('./views/PrivateLayout/index.tsx');
                    return { Component };
                },
                children: privateRoutes.map(mapRoute),
            },
            {
                lazy: async () => {
                    const { default: Component } = await import('./views/PublicLayout/index.tsx');
                    return { Component };
                },
                children: publicRoutes.map(mapRoute),
            }],
        },
    ],
    // FIXME: add error element
    // errorElement:
}]);

createRoot(document.getElementById('webapp-root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
