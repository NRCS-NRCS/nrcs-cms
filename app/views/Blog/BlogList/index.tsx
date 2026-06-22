import {
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
    createBooleanColumn,
    createDateColumn,
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import EditDeleteActions, { EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    BlogQueryQuery,
    useBlogQueryQuery,
    useDeleteBlogMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

type BlogListType = NonNullable<BlogQueryQuery['blogs']>['results'][number];

function BlogList() {
    const navigate = useRouting();
    const alert = useAlert();
    const {
        page,
        setPage,
        pageSize,
        variables,
    } = usePagination();
    const [{ fetching, data }, reExecuteQuery] = useBlogQueryQuery({ variables });
    const [, deleteBlog] = useDeleteBlogMutation();

    const onDelete = useCallback(
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

    const blogs = useMemo(
        () => data?.blogs.results ?? [],
        [data],
    );
    const columns = useMemo(
        () => ([
            createStringColumn<BlogListType, string | number>(
                'sn',
                'S.N.',
                (member) => String(blogs.indexOf(member) + 1),

            ),
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
            createElementColumn<BlogListType, string | number,
             EditDeleteActionsProps>(
                 'actions',
                 '',
                 EditDeleteActions,
                 (_, datum) => ({
                     id: datum.id,
                     onDelete,
                     itemTitle: datum.title,
                     to: 'editBlog',
                 }),
             ),
        ]),
        [onDelete, blogs],
    );

    const handleAddClick = useCallback(() => {
        navigate('addBlog');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Blog"
            headerActions={(
                <Button
                    name="addBlog"
                    disabled={false}
                    styleVariant="outline"
                    onClick={handleAddClick}
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
                data={blogs}
                filtered={false}
                pending={fetching}
            />
        </Container>
    );
}

export default BlogList;
