import {
    Link as RouterLink,
    type LinkProps,
} from 'react-router';
import {
    ArrowRightUpLineIcon,
    ChevronRightLineIcon,
} from '@ifrc-go/icons';
import {
    ButtonLayout,
    type ButtonLayoutProps,
} from '@ifrc-go/ui';
import { _cs } from '@togglecorp/fujs';

import type { RouteKeys } from '#root/config/routes';
import useRouteMatching, { type Attrs } from '#root/hooks/useRouteMatching';

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

export type CommonLinkProps = ButtonLayoutProps & {
    withLinkIcon?: boolean
    withUnderline?: boolean
};

export type Props = CommonLinkProps & (InternalLinkProps | ExternalLinkProps);

function Link(props: Props) {
    const {
        to,
        attrs,
        className,
        before,
        children,
        after,
        childrenContainerClassName,
        colorVariant = 'text',
        styleVariant = 'action',
        withoutPadding,
        spacing,
        external,
        href,
        withEllipsizedContent,
        withFullWidth,
        disabled,
        textSize,
        withLinkIcon,
        withUnderline,
        spacingOffset = styleVariant === 'action' ? -5 : -3,
        ...otherProps
    } = props;

    const routeData = useRouteMatching(to as RouteKeys, attrs);
    const content = (
        <ButtonLayout
            className={_cs(
                className,
                styles.layout,
                withUnderline
                && styles.withUnderline,
            )}
            before={before}
            childrenContainerClassName={_cs(
                childrenContainerClassName,
                styles.childrenContainer,
            )}
            spacing={spacing}
            colorVariant={colorVariant}
            styleVariant={styleVariant}
            withEllipsizedContent={withEllipsizedContent}
            spacingOffset={spacingOffset}
            withoutPadding={withoutPadding}
            withFullWidth={withFullWidth}
            disabled={disabled}
            textSize={textSize}
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
        </ButtonLayout>
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

export default Link;
