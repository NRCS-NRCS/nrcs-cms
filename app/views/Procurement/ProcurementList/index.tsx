import React, {
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
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    ProcurementQuery,
    useDeleteProcurementMutation,
    useProcurementQuery,
} from '#generated/types/graphql';
import usePagination from '#hooks/usePagination';

import styles from './styles.module.css';

type ProcurementListItem = NonNullable<ProcurementQuery['procurements']>['results'][number];

function ProcurementList() {
    const navigate = useNavigate();
    const {
        page,
        setPage,
        pageSize,
        variables,
        getFormattedData,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useProcurementQuery({ variables });
    const [{ fetching: deletePending }, deleteProcurement] = useDeleteProcurementMutation();

    const tableData = useMemo(
        () => getFormattedData<ProcurementListItem>(data?.procurements.results),
        [data, getFormattedData],
    );

    const handleDelete = useCallback(
        (id: string, closeModal: () => void) => {
            deleteProcurement({ id }).then((resp) => {
                if (resp.data?.deleteProcurement) {
                    reExecuteQuery();
                    closeModal();
                }
            });
        },
        [deleteProcurement, reExecuteQuery],
    );

    const columns = useMemo(() => [
        createNumberColumn<ProcurementListItem & { sn: number }, string | number>('sn', 'S.N.', (item) => item.sn, { columnWidth: 60 }),
        createStringColumn<ProcurementListItem, string | number>('title', 'Tile', (dept) => dept.title),
        createStringColumn<ProcurementListItem, string | number>('publishedDate', 'Published Date', (dept) => dept?.publishedDate),
        createStringColumn<ProcurementListItem, string | number>('expireDate', 'Expire Date', (dept) => dept?.expiryDate),
        createElementColumn<ProcurementListItem, string | number, TableActionsProps>(
            'actions',
            'Actions',
            TableActions,
            (_, datum) => ({
                id: datum.id,
                handleConfirmButtonChange: handleDelete,
                confirmPending: deletePending,
                itemTitle: datum.title,
            }),
            { columnWidth: 150 },
        ),
    ], [handleDelete, deletePending]);
    return (
        <Container
            className={styles.procurement}
            childrenContainerClassName={styles.content}
            heading="Procurement"
            actions={(
                <Button name={undefined} variant="primary" disabled={false} onClick={() => navigate('add')}>
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
                keySelector={(item) => item.id}
                className={styles.table}
                columns={columns}
                data={tableData}
                filtered={false}
                pending={fetching}
                headerRowClassName={styles.headerRow}
            />
        </Container>
    );
}

export default ProcurementList;
