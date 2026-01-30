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
    ProcurementQuery,
    useDeleteProcurementMutation,
    useProcurementQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

type ProcurementListItem = NonNullable<ProcurementQuery['procurements']>['results'][number];

function ProcurementList() {
    const navigate = useRouting();
    const alert = useAlert();

    const {
        page,
        setPage,
        pageSize,
        variables,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useProcurementQuery({ variables });
    const [, deleteProcurement] = useDeleteProcurementMutation();

    const tableData = useMemo(
        () => (data?.procurements?.results),
        [data],
    );

    const onDelete = useCallback(
        (id: string) => {
            deleteProcurement({ id }).then((resp) => {
                if (resp.data?.deleteProcurement) {
                    reExecuteQuery();
                    alert.show('Procurement deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteProcurement, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<ProcurementListItem, string | number>(
            'title',
            'Title',
            (dept) => dept.title,
        ),
        createStringColumn<ProcurementListItem, string | number>(
            'publishedDate',
            'Published Date',
            (dept) => dept?.publishedDate,
        ),
        createStringColumn<ProcurementListItem, string | number>(
            'expireDate',
            'Expire Date',
            (dept) => dept?.expiryDate,
        ),
        createElementColumn<ProcurementListItem, string | number,
        EditDeleteActionsProps>(
            'actions',
            '',
            EditDeleteActions,
            (_, datum) => ({
                id: datum.id,
                onDelete,
                itemTitle: datum.title,
                to: 'editProcurements',
            }),
        ),
    ], [onDelete]);

    const handleAddClick = useCallback(() => {
        navigate('addProcurements');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Procurement"
            headerActions={(
                <Button
                    name={undefined}
                    disabled={false}
                    onClick={handleAddClick}
                >
                    Add Procurement
                </Button>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.procurements.totalCount ?? 0}
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

export default ProcurementList;
