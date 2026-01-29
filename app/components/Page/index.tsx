import { RefObject } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children?: React.ReactNode;
    elementRef?: RefObject<HTMLDivElement>
    leftPaneContent?: React.ReactNode;
    leftPaneContainerClassName?: string;
}
function Page(props: Props) {
    const {
        className,
        children,
        elementRef,
        leftPaneContent,
        leftPaneContainerClassName,
    } = props;

    return (
        <div className={_cs(className, styles.page)} ref={elementRef}>
            {leftPaneContent && (
                <div className={_cs(leftPaneContainerClassName, styles.leftPane)}>
                    {leftPaneContent}
                </div>
            )}
            <div className={styles.rightPaneContent}>
                {children}
            </div>
        </div>
    );
}

export default Page;
