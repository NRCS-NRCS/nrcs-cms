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
    NewsQuery,
    useDeleteNewsMutation,
    useNewsQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import { idSelector } from '#utils/common';

type NewsListItem = NonNullable<NewsQuery['news']>['results'][number];

function NewsList() {
    const navigate = useNavigate();
    const alert = useAlert();

    const {
        page,
        setPage,
        pageSize,
        variables,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useNewsQuery({ variables });
    const [, deleteNews] = useDeleteNewsMutation();

    const tableData = useMemo(
        () => (data?.news.results),
        [data],
    );

    const handleDelete = useCallback(
        (id: string) => {
            deleteNews({ id }).then((resp) => {
                if (resp.data?.deleteNews) {
                    reExecuteQuery();
                    alert.show('News deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteNews, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<NewsListItem, string | number>('title', 'Title', (dept) => dept.title),
        createStringColumn<NewsListItem, string | number>('publishedDate', 'Published Date', (dept) => dept?.publishedDate),
        createStringColumn<NewsListItem, string | number>('directive', 'Strategic Directives', (dept) => dept?.directive?.title),
        createElementColumn<NewsListItem, string | number, TableActionsProps>(
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
            heading="News"
            headerActions={(
                <Button name={undefined} disabled={false} onClick={() => navigate('add')}>
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
                keySelector={idSelector}
                columns={columns}
                data={tableData}
                filtered={false}
                pending={fetching}
            />
        </Container>
    );
}

export default NewsList;
