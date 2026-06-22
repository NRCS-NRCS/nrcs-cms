import React, {
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
    NewsQuery,
    useDeleteNewsMutation,
    useNewsQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

type NewsListItem = NonNullable<NewsQuery['news']>['results'][number];

function NewsList() {
    const navigate = useRouting();
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
        () => data?.news.results ?? [],
        [data],
    );

    const onDelete = useCallback(
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
        createStringColumn<NewsListItem, string | number>(
            'sn',
            'S.N.',
            (member) => String(tableData.indexOf(member) + 1),
        ),
        createStringColumn<NewsListItem, string | number>(
            'title',
            'Title',
            (dept) => dept.title,
        ),
        createStringColumn<NewsListItem, string | number>(
            'publishedDate',
            'Published Date',
            (dept) => dept?.publishedDate,
        ),
        createStringColumn<NewsListItem, string | number>(
            'directive',

            'Strategic Directives',
            (dept) => dept?.directive?.title,
        ),
        createElementColumn<NewsListItem, string | number,
         EditDeleteActionsProps>(
             'actions',
             '',
             EditDeleteActions,
             (_, datum) => ({
                 id: datum.id,
                 onDelete,
                 itemTitle: datum.title,
                 to: 'editNews',
             }),
         ),
    ], [onDelete, tableData]);

    const handleAddClick = useCallback(() => {
        navigate('addNews');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="News"
            headerActions={(
                <Button
                    name={undefined}
                    disabled={false}
                    onClick={handleAddClick}
                >
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
