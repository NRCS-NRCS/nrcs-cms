import {
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
    createBooleanColumn,
    createDateColumn,
    createElementColumn,
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import ContainerWrapper from '#components/ContainerWrapper';
import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    BlogQueryQuery,
    useBlogQueryQuery,
    useDeleteBlogMutation,
} from '#generated/types/graphql';
import usePagination from '#hooks/usePagination';

type BlogListType = NonNullable<BlogQueryQuery['blogs']>['results'][number];

function BlogList() {
    const navigate = useNavigate();
    const {
        page,
        setPage,
        pageSize,
        variables,
        getFormattedData,
    } = usePagination();
    const [{ fetching, data }, reExecuteQuery] = useBlogQueryQuery({ variables });
    const [{ fetching: deletePending }, deleteBlog] = useDeleteBlogMutation();

    const tableData = useMemo(
        () => getFormattedData<BlogListType>(data?.blogs.results),
        [data, getFormattedData],
    );
    const handleDelete = useCallback(
        (id: string, closeModal: () => void) => {
            deleteBlog({ id }).then((resp) => {
                if (resp.data?.deleteBlog) {
                    reExecuteQuery();
                    closeModal();
                }
            });
        },
        [deleteBlog, reExecuteQuery],
    );
    const columns = useMemo(
        () => ([
            // Serial Number
            createNumberColumn<BlogListType & { sn: number }, string | number>(
                'sn',
                'S.N.',
                (item) => item.sn,
                { columnWidth: 60 },
            ),
            // Title
            createStringColumn<BlogListType, string | number>(
                'title',
                'Title',
                (blog) => blog.title,
                {
                    sortable: true,
                },
            ),

            // Published Date
            createDateColumn<BlogListType, string | number>(
                'publishedDate',
                'Published Date',
                (blog) => blog.publishedDate,
                {
                    sortable: true,
                },
            ),

            // Author
            createStringColumn<BlogListType, string | number>(
                'author',
                'Author',
                (blog) => blog.author,
                {
                    sortable: true,
                },
            ),

            // Featured
            createBooleanColumn<BlogListType, string | number>(
                'featured',
                'Featured',
                (blog) => blog.featured,
                {
                    sortable: true,
                },
            ),

            // Status
            createStringColumn<BlogListType, string | number>(
                'status',
                'Status',
                (blog) => blog.status,
                {
                    sortable: true,
                },
            ),

            createElementColumn<BlogListType, string | number, TableActionsProps>(
                'actions',
                'Actions',
                TableActions,
                (_, datum) => ({
                    id: datum.id,
                    handleConfirmButtonChange: handleDelete,
                    confirmPending: deletePending,
                    itemTitle: datum.title,
                }),
                {
                    columnWidth: 150,
                },
            ),

        ]),
        [handleDelete, deletePending],
    );

    return (
        <ContainerWrapper
            withPadding
            heading="Blog"
            actions={(
                <Button name={undefined} variant="primary" disabled={false} onClick={() => navigate('add')}>
                    Add blogs
                </Button>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.blogs.totalCount ?? 0}
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

export default BlogList;
