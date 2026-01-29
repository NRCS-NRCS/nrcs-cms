import {
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
    createBooleanColumn,
    createDateColumn,
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    BlogQueryQuery,
    useBlogQueryQuery,
    useDeleteBlogMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import { idSelector } from '#utils/common';

type BlogListType = NonNullable<BlogQueryQuery['blogs']>['results'][number];

function BlogList() {
    const navigate = useNavigate();
    const alert = useAlert();
    const {
        page,
        setPage,
        pageSize,
        variables,
    } = usePagination();
    const [{ fetching, data }, reExecuteQuery] = useBlogQueryQuery({ variables });
    const [, deleteBlog] = useDeleteBlogMutation();

    const handleDelete = useCallback(
        (id: string) => {
            deleteBlog({ id }).then((resp) => {
                if (resp.data?.deleteBlog) {
                    reExecuteQuery();
                    alert.show('Blog deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteBlog, reExecuteQuery, alert],
    );
    const columns = useMemo(
        () => ([
            createStringColumn<BlogListType, string | number>(
                'title',
                'Title',
                (blog) => blog.title,
            ),
            createDateColumn<BlogListType, string | number>(
                'publishedDate',
                'Published Date',
                (blog) => blog.publishedDate,
            ),
            createStringColumn<BlogListType, string | number>(
                'author',
                'Author',
                (blog) => blog.author,
            ),
            createBooleanColumn<BlogListType, string | number>(
                'featured',
                'Featured',
                (blog) => blog.featured,
            ),
            createStringColumn<BlogListType, string | number>(
                'status',
                'Status',
                (blog) => blog.status,
            ),
            createElementColumn<BlogListType, string | number, TableActionsProps>(
                'actions',
                '',
                TableActions,
                (_, datum) => ({
                    id: datum.id,
                    handleConfirmButtonChange: handleDelete,
                    itemTitle: datum.title,
                }),
            ),
        ]),
        [handleDelete],
    );

    return (
        <Container
            withPadding
            heading="Blog"
            headerActions={(
                <Button
                    name={undefined}
                    disabled={false}
                    styleVariant="outline"
                    onClick={() => navigate('add')}
                >
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
                keySelector={idSelector}
                columns={columns}
                data={data?.blogs.results}
                filtered={false}
                pending={fetching}
            />
        </Container>
    );
}

export default BlogList;
