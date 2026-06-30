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
    createBooleanColumn,
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
import useFilterState from '#hooks/useFilterState';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

import NewsListFilter, { NewsFilterUIType } from '../NewsListFilters';

type NewsListItem = NonNullable<NewsQuery['news']>['results'][number] & { no: number };

const defaultFilter: NewsFilterUIType = {
    status: undefined,
    isHighlighted: undefined,
    search: undefined,
};

function NewsList() {
    const navigate = useRouting();
    const alert = useAlert();

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
            isHighlighted: filter.isHighlighted !== undefined
                ? filter.isHighlighted === 'true'
                : undefined,
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
            });
        },
        [deleteNews, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
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

        createBooleanColumn<NewsListItem, string | number>(
            'highlighted',
            'Highlighted',
            (dept) => dept?.isHighlighted,
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
    ], [onDelete]);

    const handleAddClick = useCallback(() => {
        navigate('addNews');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="News"
            headerDescription="Manage news articles and highlights"
            headerActions={(
                <Button
                    name="addNews"
                    styleVariant="filled"
                    before={(<AddFillIcon />)}
                    onClick={handleAddClick}
                >
                    Add News
                </Button>
            )}
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
