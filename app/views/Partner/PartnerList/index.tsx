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
    createStringColumn,
} from '@ifrc-go/ui/utils';

import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    PartnerQuery,
    useDeletePartnerMutation,
    usePartnerQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import { idSelector } from '#utils/common';

type PartnerListItem = NonNullable<PartnerQuery['partners']>['results'][number];

function PartnerList() {
    const navigate = useNavigate();
    const alert = useAlert();

    const {
        page,
        setPage,
        pageSize,
        variables,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = usePartnerQuery({ variables });
    const [, deletePartner] = useDeletePartnerMutation();

    const tableData = useMemo(
        () => (data?.partners.results),
        [data],
    );

    const handleDelete = useCallback(
        (id: string) => {
            deletePartner({ id }).then((resp) => {
                if (resp.data?.deletePartner) {
                    reExecuteQuery();
                    alert.show('Partner deleted successfully', { variant: 'success' });
                }
            });
        },
        [deletePartner, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<PartnerListItem, string | number>('title', 'Title', (dept) => dept.title),
        createStringColumn<PartnerListItem, string | number>('scope', 'Scope', (dept) => dept?.scope),
        createElementColumn<PartnerListItem, string | number, TableActionsProps>(
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
            heading="Partner"
            headerActions={(
                <Button name={undefined} disabled={false} onClick={() => navigate('add')}>
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
                keySelector={idSelector}
                columns={columns}
                data={tableData}
                filtered={false}
                pending={fetching}
            />
        </Container>
    );
}

export default PartnerList;
