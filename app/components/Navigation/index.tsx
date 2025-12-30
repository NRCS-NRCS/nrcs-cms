import {
    ReactNode,
    useState,
} from 'react';
import {
    IoChevronDownOutline,
    IoChevronUpOutline,
} from 'react-icons/io5';
import { NavLink } from 'react-router';
import { Button } from '@ifrc-go/ui';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface NavigationItem {
    title: string;
    to?: string;
    icon?: ReactNode;
    variant: 'root' | 'group' | 'leaf';
    children?: NavigationItem[];

}
function Navigation({ navigationItem }: { navigationItem: NavigationItem[] }) {
    const [openIndexes, setOpenIndexes] = useState(
        navigationItem.map((_, i) => i),
    );

    const toggleAccordion = (index: number) => {
        setOpenIndexes((prev) => (prev.includes(index)
            ? prev.filter((i) => i !== index)
            : [...prev, index]));
    };

    return (
        <nav className={styles.nav}>
            {navigationItem.map((item, index) => {
                const isOpen = openIndexes.includes(index);
                return (
                    <div
                        key={item.title}
                        className={_cs(
                            styles[item.variant ?? 'leaf'],
                        )}
                    >
                        <Button
                            name={item.title}
                            type="button"
                            className={styles.navHeaderContainer}
                            childrenContainerClassName={styles.navHeader}
                            onClick={() => toggleAccordion(index)}
                            variant="tertiary"
                            icons={item.icon}
                        >
                            {item.title}
                            {isOpen ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
                        </Button>
                        {isOpen && (
                            <div
                                className={_cs(
                                    styles.navContent,
                                    styles[item.variant ?? 'leaf'],
                                )}
                            >
                                {item.children && item.children.map((child) => {
                                    if (!child.to && child.children) {
                                        return (
                                            <Navigation
                                                key={child.title}
                                                navigationItem={[child]}
                                            />
                                        );
                                    }
                                    return (
                                        <NavLink
                                            key={child.to}
                                            to={child.to ?? ''}
                                            className={({ isActive }) => _cs(
                                                styles.routeLink,
                                                isActive && styles.activeRoute,
                                                styles[child.variant ?? 'leaf'],

                                            )}
                                        >
                                            {child.title}
                                        </NavLink>
                                    );
                                })}

                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}

export default Navigation;
