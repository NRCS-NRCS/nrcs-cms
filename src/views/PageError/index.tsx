import {
    isRouteErrorResponse,
    useRouteError,
} from 'react-router';

import styles from './styles.module.css';

function PageError() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
            <div className={styles.pageError}>
                <h1>
                    <span>{error.status}</span>
                    {' '}
                    <span>{error.statusText}</span>
                </h1>
                <div>
                    {error.data?.message ?? 'Someting went wrong!'}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageError}>
            <h1>Unexpected Application Error!</h1>
            <div>
                {error instanceof Error ? error.message : 'Something went wrong!'}
            </div>
        </div>
    );
}

export default PageError;
