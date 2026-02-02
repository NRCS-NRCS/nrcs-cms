import {
    useCallback,
    useMemo,
} from 'react';
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

import EditDeleteActions, { EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    StrategicDirectiveQuery,
    useDeleteStrategicDirectiveMutation,
    useStrategicDirectiveQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

type StrategicDirectiveListItem = NonNullable<StrategicDirectiveQuery['strategicDirectives']>['results'][number];

function StrategicDirectiveList() {
    const navigate = useRouting();
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

    const onDelete = useCallback(
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
        createStringColumn<StrategicDirectiveListItem, string | number>(
            'title',
            'Title',
            (dept) => dept.title,
        ),
        createElementColumn<StrategicDirectiveListItem, string | number,
        EditDeleteActionsProps>(
            'actions',
            '',
            EditDeleteActions,
            (_, datum) => ({
                id: datum.id,
                onDelete,
                itemTitle: datum.title,
                to: 'editStrategicDirectives',
            }),
        ),
    ], [onDelete]);

    const handleAddClick = useCallback(() => {
        navigate('addStrategicDirectives');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Strategic Directive"
            headerActions={(
                <Button
                    name={undefined}
                    disabled={false}
                    onClick={handleAddClick}
                >
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
