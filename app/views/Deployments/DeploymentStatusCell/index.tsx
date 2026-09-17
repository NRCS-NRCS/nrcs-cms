import { ListView } from '@ifrc-go/ui';

import { DeploymentStatusEnum } from '#generated/types/graphql';

import styles from './styles.module.css';

const statusDetails: Record<DeploymentStatusEnum, { label: string, className: string }> = {
    [DeploymentStatusEnum.Queued]: { label: 'Queued', className: styles.queued },
    [DeploymentStatusEnum.InProgress]: { label: 'In progress', className: styles.inProgress },
    [DeploymentStatusEnum.Success]: { label: 'Success', className: styles.success },
    [DeploymentStatusEnum.Failed]: { label: 'Failed', className: styles.failed },
    [DeploymentStatusEnum.Cancelled]: { label: 'Cancelled', className: styles.cancelled },
    [DeploymentStatusEnum.Unknown]: { label: 'Unknown', className: styles.unknown },
};

export interface Props {
    status: DeploymentStatusEnum;
}

function DeploymentStatusCell({ status }: Props) {
    const { label, className } = statusDetails[status]
        ?? statusDetails[DeploymentStatusEnum.Unknown];

    return (
        <ListView
            layout="inline"
            spacing="sm"
        >
            <span className={`${styles.statusIndicator} ${className}`} />
            <span>{label}</span>
        </ListView>
    );
}

export default DeploymentStatusCell;
