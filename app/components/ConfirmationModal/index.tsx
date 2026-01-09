import {
    Button,
    Modal,
} from '@ifrc-go/ui';

import styles from './styles.module.css';

interface Props {
    onClose: () => void;
    handleConfirmButtonChange: () => void;
    confirmPending?: boolean;
    type: 'save' | 'delete';
    itemTitle?: string;

}

function ConfirmationModal(props: Props) {
    const {
        onClose,
        handleConfirmButtonChange,
        confirmPending = false,
        type,
        itemTitle,
    } = props;

    const confirmationModalDescription = type === 'delete'
        ? `Are you sure you want to delete ${itemTitle || 'this item'}? This action cannot be undone.`
        : `Are you sure you want to save changes to ${itemTitle || 'this item'}?`;

    return (
        <Modal
            onClose={onClose}
            heading="Confirmation"
            className={styles.confirmation}
            headerDescription={confirmationModalDescription}
            size="sm"
            footerActions={(
                <div className={styles.confirmationBtn}>
                    <Button
                        name={undefined}
                        onClick={onClose}
                        variant="tertiary"
                    >
                        Cancel
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleConfirmButtonChange}
                        disabled={confirmPending}
                    >
                        {confirmPending ? 'Confirming' : 'Confirm'}
                    </Button>
                </div>
            )}
        />
    );
}

export default ConfirmationModal;
