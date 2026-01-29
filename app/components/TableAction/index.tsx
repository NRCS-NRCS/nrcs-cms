import { useNavigate } from 'react-router';
import {
    DeleteBinLineIcon,
    EditTwoLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    ConfirmButton,
    TableActions as GoTableAction,
} from '@ifrc-go/ui';

export interface TableActionsProps {
    id: string;
    handleConfirmButtonChange: (id: string) => void
    itemTitle: string
}

function TableActions(props: TableActionsProps) {
    const navigate = useNavigate();
    const {
        id, handleConfirmButtonChange, itemTitle,
    } = props;

    return (
        <GoTableAction>
            <Button
                name={undefined}
                styleVariant="action"
                colorVariant="secondary"
                onClick={() => navigate(`${id}/edit`)}
            >
                <EditTwoLineIcon />
            </Button>
            <ConfirmButton
                name={id}
                styleVariant="action"
                colorVariant="secondary"
                onConfirm={handleConfirmButtonChange}
                confirmMessage={`Are you sure you want to delete ${`"${itemTitle}"` || 'this item'}? This action cannot be undone.`}
            >
                <DeleteBinLineIcon />
            </ConfirmButton>
        </GoTableAction>
    );
}

export default TableActions;
