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
    FaqQuery,
    useDeleteFaqMutation,
    useFaqQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import { idSelector } from '#utils/common';

type FaqListItem = NonNullable<FaqQuery['faqs']>['results'][number];

function FAQsList() {
    const navigate = useNavigate();
    const alert = useAlert();

    const {
        page,
        setPage,
        pageSize,
        variables,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useFaqQuery({ variables });
    const [, deleteFaq] = useDeleteFaqMutation();

    const tableData = data?.faqs.results;

    const handleDelete = useCallback(
        (id: string) => {
            deleteFaq({ id }).then((resp) => {
                if (resp.data?.deleteFaq) {
                    reExecuteQuery();
                    alert.show('FAQ deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteFaq, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<FaqListItem, string | number>('question', 'Question', (dept) => dept.question),
        createStringColumn<FaqListItem, string | number>('answer', 'Answer', (dept) => dept?.answer),
        createNumberColumn<FaqListItem, string | number>('orderIndex', 'Order Index', (dept) => dept.orderIndex),
        createElementColumn<FaqListItem, string | number, TableActionsProps>(
            'actions',
            '',
            TableActions,
            (_, datum) => ({
                id: datum.id,
                handleConfirmButtonChange: handleDelete,
                itemTitle: datum.question,
            }),
            { columnWidth: 150 },
        ),
    ], [handleDelete]);
    return (
        <Container
            withPadding
            heading="FAQs"
            headerActions={(
                <Button name={undefined} styleVariant="outline" disabled={false} onClick={() => navigate('add')}>
                    Add FAQs
                </Button>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.faqs.totalCount ?? 0}
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

export default FAQsList;
