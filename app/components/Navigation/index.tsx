import { type ReactNode } from 'react';
import {
    Heading,
    InlineLayout,
    ListView,
    NavigationTabList,
} from '@ifrc-go/ui';

import NavigationTab from '#components/NavigationTab';
import { type RouteKeys } from '#root/config/routes';
import routes from '#root/config/routes';

import styles from './styles.module.css';

interface Routes {
    to: RouteKeys;
    icon?: ReactNode;
}

export interface NavigationItem {
    groupTitle: string;
    routes: Routes[];
}
interface NavigationProps {
    navigationItem: NavigationItem[];
}
function Navigation({ navigationItem }: NavigationProps) {
    return (
        <nav
            className={styles.nav}
        >
            {navigationItem.map((item) => (
                <div key={item.groupTitle}>
                    <ListView
                        withPadding
                        withDarkBackground
                        spacing="sm"
                        className={styles.groupTitle}
                    >
                        <Heading level={6}>
                            {item.groupTitle}
                        </Heading>
                    </ListView>
                    <NavigationTabList
                        spacing="none"
                        styleVariant="vertical-compact"
                    >
                        {item.routes.map((route) => (
                            <NavigationTab
                                key={route.to}
                                to={route.to}
                                activeClassName={styles.activeRoute}
                                className={styles.routeLink}
                            >
                                <InlineLayout
                                    withPadding
                                    before={
                                        route.icon
                                            ? <span className={styles.routeIcon}>{route.icon}</span>
                                            : undefined
                                    }
                                    spacing="xs"
                                >
                                    {routes[route.to].label}
                                </InlineLayout>
                            </NavigationTab>
                        ))}
                    </NavigationTabList>
                </div>
            ))}
        </nav>
    );
}

export default Navigation;
