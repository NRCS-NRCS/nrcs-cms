import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
    DeleteBinLineIcon,
    EditTwoLineIcon,
} from '@ifrc-go/icons';
import { Button } from '@ifrc-go/ui';

import ConfirmationModal from '#components/ConfirmationModal';

import styles from './styles.module.css';

export interface TableActionsProps {
    id: string;
    handleConfirmButtonChange: (id: string, closeModal: () => void) => void
    confirmPending?: boolean
}

function TableActions(props: TableActionsProps) {
    const navigate = useNavigate();
    const { id, handleConfirmButtonChange, confirmPending } = props;
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const handleClose = () => {
        setOpenDeleteModal(false);
    };

    const handleConfirmButton = () => {
        handleConfirmButtonChange(id, handleClose);
    };

    return (
        <div className={styles.tableAction}>
            {(openDeleteModal) && (
                <ConfirmationModal
                    onClose={handleClose}
                    type="delete"
                    handleConfirmButtonChange={handleConfirmButton}
                    confirmPending={confirmPending}
                />
            )}
            <Button
                name={undefined}
                variant="tertiary"
                onClick={() => navigate(`${id}/edit`)}
            >
                <EditTwoLineIcon />
            </Button>
            <Button
                name={undefined}
                variant="tertiary"
                onClick={() => setOpenDeleteModal(true)}
            >
                <DeleteBinLineIcon />
            </Button>
        </div>
    );
}

export default TableActions;
