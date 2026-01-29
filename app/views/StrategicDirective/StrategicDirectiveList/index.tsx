import {
    useCallback,
    useMemo,
} from 'react';
import { useNavigate } from 'react-router';
import {
    Button,
    Container,
    Pager,
    Table,
} from '@ifrc-go/ui';
import {
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    StrategicDirectiveQuery,
    useDeleteStrategicDirectiveMutation,
    useStrategicDirectiveQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import { idSelector } from '#utils/common';

type StrategicDirectiveListItem = NonNullable<StrategicDirectiveQuery['strategicDirectives']>['results'][number];

function StrategicDirectiveList() {
    const navigate = useNavigate();
    const alert = useAlert();

    const {
        page,
        setPage,
        pageSize,
        variables,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useStrategicDirectiveQuery({ variables });
    const [, deleteStrategicDirective] = useDeleteStrategicDirectiveMutation();

    const tableData = useMemo(
        () => (data?.strategicDirectives.results),
        [data],
    );

    const handleDelete = useCallback(
        (id: string) => {
            deleteStrategicDirective({ id }).then((resp) => {
                if (resp.data?.deleteStrategicDirectives) {
                    reExecuteQuery();
                    alert.show('Strategic Directive deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteStrategicDirective, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<StrategicDirectiveListItem, string | number>('title', 'Title', (dept) => dept.title),
        createElementColumn<StrategicDirectiveListItem, string | number, TableActionsProps>(
            'actions',
            '',
            TableActions,
            (_, datum) => ({
                id: datum.id,
                handleConfirmButtonChange: handleDelete,
                itemTitle: datum.title,
            }),
        ),
    ], [handleDelete]);
    return (
        <Container
            withPadding
            heading="Strategic Directive"
            headerActions={(
                <Button name={undefined} disabled={false} onClick={() => navigate('add')}>
                    Add Strategic Directive
                </Button>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.strategicDirectives.totalCount ?? 0}
                    maxItemsPerPage={pageSize}
                    onActivePageChange={setPage}
                />
            )}
        >
            <Table
                keySelector={idSelector}
                columns={columns}
                data={tableData}
                filtered={false}
                pending={fetching}
            />
        </Container>
    );
}

export default StrategicDirectiveList;
