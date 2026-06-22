import { useContext } from 'react';
import {
    Link as RouterLink,
    type LinkProps,
    useMatch,
} from 'react-router';
import {
    ArrowRightUpLineIcon,
    ChevronRightLineIcon,
} from '@ifrc-go/icons';
import {
    TabLayout,
    type TabLayoutProps,
} from '@ifrc-go/ui';
import { NavigationTabContext } from '@ifrc-go/ui/contexts';
import { _cs } from '@togglecorp/fujs';

import type { RouteKeys } from '#root/config/routes';
import useRouteMatching, { Attrs } from '#root/hooks/useRouteMatching';

import styles from './styles.module.css';

interface InternalLinkProps extends Omit<LinkProps, 'to'> {
    external?: never;
    href?: never;
    to: RouteKeys;
    attrs?: Attrs
}

interface ExternalLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    external: true;
    href: string | undefined | null;
    to?: never;
    attrs?: never
}

type CommonProps = Omit<TabLayoutProps, 'styleVariant' | 'colorVariant'> & {
    withEllipsizedContent?: boolean;
    withLinkIcon?: boolean;
    withUnderline?: boolean;
    activeClassName?: string;
}

export type Props = CommonProps & (InternalLinkProps | ExternalLinkProps);

function NavigationTab(props: Props) {
    const {
        to,
        attrs,
        className,
        before,
        children,
        after,
        childrenContainerClassName,
        withoutPadding,
        spacing,
        external,
        href,
        withEllipsizedContent,
        spacingOffset,
        disabled,
        withLinkIcon,
        tabWrapperClassName,
        errored,
        stepCompleted,
        isFirstStep,
        isLastStep,
        activeClassName,
        ...otherProps
    } = props;

    const {
        colorVariant,
        styleVariant,
    } = useContext(NavigationTabContext);
    const routeData = useRouteMatching(to as RouteKeys, attrs);

    const routePath = routeData?.to ?? '';
    const match = useMatch({ path: routePath, end: routePath === '/' });
    const isActive = !!match;

    const content = (
        <TabLayout
            className={_cs(className, isActive && activeClassName)}
            colorVariant={colorVariant}
            styleVariant={styleVariant}
            before={before}
            childrenContainerClassName={childrenContainerClassName}
            spacing={spacing}
            withEllipsizedContent={withEllipsizedContent}
            spacingOffset={spacingOffset}
            withoutPadding={withoutPadding}
            disabled={disabled}
            tabWrapperClassName={tabWrapperClassName}
            active={isActive}
            errored={errored}
            stepCompleted={stepCompleted}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            after={(
                <>
                    {after}
                    {withLinkIcon && external && (
                        <ArrowRightUpLineIcon className={styles.linkIcon} />
                    )}
                    {withLinkIcon && !external && (
                        <ChevronRightLineIcon className={styles.linkIcon} />
                    )}
                </>
            )}
        >
            {children}
        </TabLayout>
    );

    if (external) {
        if (!href) {
            return (
                <span className={styles.link}>
                    {content}
                </span>
            );
        }
        return (
            <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.link}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
            >
                {content}
            </a>
        );
    }

    if (!routeData) {
        return null;
    }

    return (
        <RouterLink
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={styles.link}
            to={routeData.to}
        >
            {content}
        </RouterLink>
    );
}

export default NavigationTab;
