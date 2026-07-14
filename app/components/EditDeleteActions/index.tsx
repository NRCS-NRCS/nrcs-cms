import { useCallback } from 'react';
import {
    DeleteBinLineIcon,
    EditTwoLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    ConfirmButton,
    TableActions,
} from '@ifrc-go/ui';

import useRouting, { type RoutesMap } from '#hooks/useRouting';

export interface EditDeleteActionsProps {
    id: string ;
    onDelete: (id: string) => void;
    itemTitle: string;
    to: keyof RoutesMap ;
}

function EditDeleteActions(props: EditDeleteActionsProps) {
    const {
        id,
        onDelete,
        itemTitle,
        to,
    } = props;

    const navigate = useRouting();

    const handleEditClick = useCallback(() => {
        navigate(to, { id });
    }, [navigate, to, id]);

    return (
        <TableActions>
            <Button
                name={undefined}
                styleVariant="action"
                colorVariant="secondary"
                onClick={handleEditClick}
            >
                <EditTwoLineIcon />
            </Button>
            <ConfirmButton
                name={id}
                styleVariant="action"
                colorVariant="secondary"
                onConfirm={onDelete}
                confirmMessage={`Are you sure you want to delete ${`"${itemTitle}"` || 'this item'}? This action cannot be undone.`}
            >
                <DeleteBinLineIcon />
            </ConfirmButton>
        </TableActions>
    );
}

export default EditDeleteActions;
