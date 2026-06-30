import { ListView } from '@ifrc-go/ui';

import styles from './styles.module.css';

export interface Props {
    isActive: boolean;
}

function StatusCell({ isActive }: Props) {
    return (
        <ListView
            layout="inline"
            spacing="sm"
        >
            <span
                className={`${styles.statusIndicator} ${isActive ? styles.active : styles.inactive}`}
            />
            <span>{isActive ? 'Active' : 'Inactive'}</span>
        </ListView>
    );
}

export default StatusCell;
