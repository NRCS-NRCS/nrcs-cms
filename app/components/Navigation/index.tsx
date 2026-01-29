import {
    ReactNode,
    useCallback,
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
interface NavigationProps {
    navigationItem: NavigationItem[];
}
function Navigation({ navigationItem }: NavigationProps) {
    const [openAccordion, setOpenAccordion] = useState(
        navigationItem.map((_, i) => i),
    );

    const toggleAccordion = useCallback((index: number) => {
        setOpenAccordion((prev) => (prev.includes(index)
            ? prev.filter((i) => i !== index)
            : [...prev, index]));
    }, []);

    return (
        <nav className={styles.nav}>
            {navigationItem.map((item, index) => {
                const isOpen = openAccordion.includes(index);
                return (
                    <div
                        key={item.title}
                        className={_cs(
                            styles[item.variant ?? 'leaf'],
                        )}
                    >
                        <Button
                            name={index}
                            type="button"
                            className={styles.navHeaderContainer}
                            onClick={toggleAccordion}
                            styleVariant="action"
                            withoutPadding
                            withFullWidth
                            before={item.icon}
                            after={isOpen ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
                        >
                            {item.title}
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
