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
import usePagination from '#hooks/usePagination';

import styles from './styles.module.css';

type FaqListItem = NonNullable<FaqQuery['faqs']>['results'][number];

function FAQsList() {
    const navigate = useNavigate();
    const {
        page,
        setPage,
        pageSize,
        variables,
        getFormattedData,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useFaqQuery({ variables });
    const [{ fetching: deletePending }, deleteFaq] = useDeleteFaqMutation();

    const tableData = useMemo(
        () => getFormattedData<FaqListItem>(data?.faqs.results),
        [data, getFormattedData],
    );

    const handleDelete = useCallback(
        (id: string, closeModal: () => void) => {
            deleteFaq({ id }).then((resp) => {
                if (resp.data?.deleteFaq) {
                    reExecuteQuery();
                    closeModal();
                }
            });
        },
        [deleteFaq, reExecuteQuery],
    );

    const columns = useMemo(() => [
        createNumberColumn<FaqListItem & { sn: number }, string | number>('sn', 'S.N.', (item) => item.sn, { columnWidth: 60 }),
        createStringColumn<FaqListItem, string | number>('question', 'Question', (dept) => dept.question),
        createStringColumn<FaqListItem, string | number>('answer', 'Answer', (dept) => dept?.answer),
        createNumberColumn<FaqListItem, string | number>('orderIndex', 'Order Index', (dept) => dept.orderIndex),
        createElementColumn<FaqListItem, string | number, TableActionsProps>(
            'actions',
            'Actions',
            TableActions,
            (_, datum) => ({
                id: datum.id,
                handleConfirmButtonChange: handleDelete,
                confirmPending: deletePending,
                itemTitle: datum.question,
            }),
            { columnWidth: 150 },
        ),
    ], [handleDelete, deletePending]);
    return (
        <Container
            className={styles.faq}
            childrenContainerClassName={styles.content}
            heading="FAQs"
            actions={(
                <Button name={undefined} variant="primary" disabled={false} onClick={() => navigate('add')}>
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

export default FAQsList;
