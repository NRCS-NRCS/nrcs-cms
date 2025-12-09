import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router';
import './index.css'
import routes, { type RouteConfig } from './routes/routes.tsx';
import PageError from './views/PageError';


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
    const { default: Component } = await import('./layout/RootLayout');
    return { Component };
  },
  children: [
    {
      lazy: async () => {
        const { default: Component } = await import('./layout/GuestLayout');
        return { Component };
      },
      children: guestRoutes.map(mapRoute),
    },
    {
      lazy: async () => {
        const { default: Component } = await import('./layout/PrivateLayout');
        return { Component };
      },
      children: privateRoutes.map(mapRoute),
    },
    {
      lazy: async () => {
        const { default: Component } = await import('./layout/PublicLayout');
        return { Component };
      },
      children: publicRoutes.map(mapRoute),
    },
  ],
  // FIXME: add error element
  // errorElement:
}]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}
    />
  </StrictMode>,
)
