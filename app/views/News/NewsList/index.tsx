import React, {
    useCallback,
    useMemo,
} from 'react';
import { useNavigate } from 'react-router';
import {
    Button,
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
    NewsQuery,
    useDeleteNewsMutation,
    useNewsQuery,
} from '#generated/types/graphql';
import usePagination from '#hooks/usePagination';

type NewsListItem = NonNullable<NewsQuery['news']>['results'][number];

function NewsList() {
    const navigate = useNavigate();
    const {
        page,
        setPage,
        pageSize,
        variables,
        getFormattedData,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useNewsQuery({ variables });
    const [{ fetching: deletePending }, deleteNews] = useDeleteNewsMutation();

    const tableData = useMemo(
        () => getFormattedData<NewsListItem>(data?.news.results),
        [data, getFormattedData],
    );

    const handleDelete = useCallback(
        (id: string, closeModal: () => void) => {
            deleteNews({ id }).then((resp) => {
                if (resp.data?.deleteNews) {
                    reExecuteQuery();
                    closeModal();
                }
            });
        },
        [deleteNews, reExecuteQuery],
    );

    const columns = useMemo(() => [
        createNumberColumn<NewsListItem & { sn: number }, string | number>('sn', 'S.N.', (item) => item.sn, { columnWidth: 60 }),
        createStringColumn<NewsListItem, string | number>('title', 'Title', (dept) => dept.title),
        createStringColumn<NewsListItem, string | number>('publishedDate', 'Published Date', (dept) => dept?.publishedDate),
        createStringColumn<NewsListItem, string | number>('directive', 'Strategic Directives', (dept) => dept?.directive?.title),
        createElementColumn<NewsListItem, string | number, TableActionsProps>(
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
            heading="News"
            actions={(
                <Button name={undefined} variant="primary" disabled={false} onClick={() => navigate('add')}>
                    Add News
                </Button>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.news.totalCount ?? 0}
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

export default NewsList;
