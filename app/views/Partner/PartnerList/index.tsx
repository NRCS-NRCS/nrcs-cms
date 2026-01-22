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

import ContainerWrapper from '#components/ContainerWrapper';
import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    PartnerQuery,
    useDeletePartnerMutation,
    usePartnerQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';

type PartnerListItem = NonNullable<PartnerQuery['partners']>['results'][number];

function PartnerList() {
    const navigate = useNavigate();
    const alert = useAlert();

    const {
        page,
        setPage,
        pageSize,
        variables,
        getFormattedData,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = usePartnerQuery({ variables });
    const [{ fetching: deletePending }, deletePartner] = useDeletePartnerMutation();

    const tableData = useMemo(
        () => getFormattedData<PartnerListItem>(data?.partners.results),
        [data, getFormattedData],
    );

    const handleDelete = useCallback(
        (id: string, closeModal: () => void) => {
            deletePartner({ id }).then((resp) => {
                if (resp.data?.deletePartner) {
                    reExecuteQuery();
                    closeModal();
                    alert.show('Partner deleted successfully', { variant: 'success' });
                }
            });
        },
        [deletePartner, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createNumberColumn<PartnerListItem & { sn: number }, string | number>('sn', 'S.N.', (item) => item.sn, { columnWidth: 60 }),
        createStringColumn<PartnerListItem, string | number>('title', 'Title', (dept) => dept.title),
        createStringColumn<PartnerListItem, string | number>('scope', 'Scope', (dept) => dept?.scope),
        createElementColumn<PartnerListItem, string | number, TableActionsProps>(
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
        <ContainerWrapper
            withPadding
            heading="Partner"
            actions={(
                <Button name={undefined} variant="primary" disabled={false} onClick={() => navigate('add')}>
                    Add Partner
                </Button>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.partners.totalCount ?? 0}
                    maxItemsPerPage={pageSize}
                    onActivePageChange={setPage}
                />
            )}
        >
            <Table
                keySelector={(item) => item.id}
                columns={columns}
                data={tableData}
                filtered={false}
                pending={fetching}
            />
        </ContainerWrapper>
    );
}

export default PartnerList;
