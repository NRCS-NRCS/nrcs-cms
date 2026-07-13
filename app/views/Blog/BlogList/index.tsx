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
    createDateColumn,
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import { useQuery } from 'urql';

import EditDeleteActions, { type EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    type BlogFilter,
    type BlogQueryQuery,
    useDeleteBlogMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

import BlogListFilter, { type BlogFilterUIType } from '../BlogListFilters';
import { BLOG_QUERY } from '../query';

type BlogListType = NonNullable<BlogQueryQuery['blogs']>['results'][number] & { no: number };

type BlogQueryVariables = {
    pagination?: { limit: number; offset: number };
    filters?: { status?: BlogFilter['status'] | null; search?: string | null } | null;
};

const defaultFilter: BlogFilterUIType = {
    status: undefined,
    search: undefined,
};

function BlogList() {
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

    const queryVariables = useMemo<BlogQueryVariables>(() => ({
        filters: {
            status: filter.status,
            search: filter.search || undefined,
        },
        pagination: {
            limit,
            offset,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useQuery<BlogQueryQuery, BlogQueryVariables>({
        query: BLOG_QUERY,
        variables: queryVariables,
    });

    const [, deleteBlog] = useDeleteBlogMutation();

    const onDelete = useCallback(
        (id: string) => {
            deleteBlog({ id }).then((resp) => {
                if (resp.data?.deleteBlog) {
                    reExecuteQuery({ requestPolicy: 'network-only' });
                    alert.show('Blog deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteBlog, reExecuteQuery, alert],
    );

    const blogs = useMemo(
        () => (data?.blogs.results ?? []).map((item, index) => ({
            ...item,
            no: (page - 1) * limit + index + 1,
        })),
        [data, page, limit],
    );

    const columns = useMemo(
        () => ([
            createStringColumn<BlogListType, string | number>(
                'sn',
                'S.N.',
                (member) => String(member.no),
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
            ...(canEditContent ? [createElementColumn<BlogListType, string | number,
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
             )] : []),
        ]),
        [onDelete, canEditContent],
    );

    const handleAddClick = useCallback(() => {
        navigate('addBlog');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Blog"
            headerDescription="Manage and publish blog articles"
            headerActions={canEditContent ? (
                <Button
                    name="addBlog"
                    styleVariant="filled"
                    before={(<AddFillIcon />)}
                    onClick={handleAddClick}
                >
                    Add blogs
                </Button>
            ) : undefined}
            filters={(
                <BlogListFilter
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.blogs.totalCount ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <Table
                keySelector={idSelector}
                columns={columns}
                data={blogs}
                filtered={filtered}
                pending={fetching}
            />
        </Container>
    );
}

export default BlogList;
