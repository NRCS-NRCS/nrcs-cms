import {
    useCallback,
    useMemo,
} from 'react';
import { AddFillIcon } from '@ifrc-go/icons';
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

import EditDeleteActions, { type EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    type NewsFilter,
    type NewsQuery,
    StatusEnum,
    useDeleteNewsMutation,
    useNewsQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

import NewsListFilter from '../NewsListFilters';

type NewsListItem = NonNullable<NewsQuery['news']>['results'][number] & { no: number };

const defaultFilter: NewsFilter = {
    status: undefined,
    search: undefined,
};

function NewsList() {
    const navigate = useRouting();
    const alert = useAlert();
    const { canEditContent } = usePermissions();

    const {
        filter,
        rawFilter,
        filtered,
        setFilterField,
        page,
        setPage,
        limit,
        offset,
    } = useFilterState({
        filter: defaultFilter,
    });

    const queryVariables = useMemo(() => ({
        filter: {
            status: filter.status ?? undefined,
            search: filter.search || undefined,
        },
        pagination: {
            limit,
            offset,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useNewsQuery({ variables: queryVariables });
    const [, deleteNews] = useDeleteNewsMutation();

    const tableData = useMemo(
        () => (data?.news.results ?? []).map((item, index) => ({
            ...item,
            no: (page - 1) * limit + index + 1,
        })),
        [data, page, limit],
    );

    const onDelete = useCallback(
        (id: string) => {
            deleteNews({ id }).then((resp) => {
                if (resp.data?.deleteNews) {
                    reExecuteQuery();
                    alert.show('News deleted successfully', { variant: 'success' });
                }
            }).catch(() => {
                alert.show('Failed to delete news', { variant: 'danger' });
            });
        },
        [deleteNews, reExecuteQuery, alert],
    );

    const columns = useMemo(() => {
        const status: Record<StatusEnum, string> = {
            [StatusEnum.Draft]: 'Draft',
            [StatusEnum.Archived]: 'Archived',
            [StatusEnum.Published]: 'Published',
        };

        return [
            createStringColumn<NewsListItem, string | number>(
                'sn',
                'S.N.',
                (member) => String(member.no),
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
                'status',
                'Status',
                (dept) => status[dept.status],
            ),
            createStringColumn<NewsListItem, string | number>(
                'directive',
                'Strategic Directives',
                (dept) => dept?.directive?.title,
            ),
            ...(canEditContent
                ? [createElementColumn<NewsListItem, string | number,
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
             )] : []),
        ];
    }, [canEditContent, onDelete]);

    const handleAddClick = useCallback(() => {
        navigate('addNews');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="News"
            headerDescription="Manage news articles and highlights"
            headerActions={canEditContent ? (
                <Button
                    name="addNews"
                    styleVariant="filled"
                    before={(<AddFillIcon />)}
                    onClick={handleAddClick}
                >
                    Add News
                </Button>
            ) : undefined}
            filters={(
                <NewsListFilter
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.news.totalCount ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <Table
                keySelector={idSelector}
                columns={columns}
                data={tableData}
                filtered={filtered}
                pending={fetching}
            />
        </Container>
    );
}

export default NewsList;
