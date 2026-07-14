import { ListView } from '@ifrc-go/ui';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children?: React.ReactNode;
    leftPaneContent?: React.ReactNode;
    leftPaneContainerClassName?: string;
}
function Page(props: Props) {
    const {
        className,
        children,
        leftPaneContent,
        leftPaneContainerClassName,
    } = props;

    return (
        <ListView
            layout="grid"
            withSidebar
            sidebarPosition="start"
            className={_cs(className, styles.page)}
            spacing="none"
        >
            {leftPaneContent && (
                <ListView
                    layout="block"
                    withBackground
                    className={_cs(leftPaneContainerClassName, styles.content)}
                >
                    {leftPaneContent}
                </ListView>
            )}
            <ListView
                layout="block"
                className={styles.content}
            >
                {children}
            </ListView>
        </ListView>
    );
}

export default Page;
