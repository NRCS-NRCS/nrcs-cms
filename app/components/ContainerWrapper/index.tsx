import { ReactNode } from 'react';
import { Container } from '@ifrc-go/ui';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface ContainerWrapperProps {
    children?: ReactNode;
    heading?: string;
    actions?: ReactNode;
    footerActions?: ReactNode;
    withPadding?: boolean;
}

function ContainerWrapper(props: ContainerWrapperProps) {
    const {
        children, heading, footerActions, actions, withPadding = false,
    } = props;
    return (
        <Container
            className={_cs(styles.container, withPadding && styles.withPadding)}
            heading={heading}
            footerActions={footerActions}
            actions={actions}
        >
            {children}
        </Container>
    );
}

export default ContainerWrapper;
