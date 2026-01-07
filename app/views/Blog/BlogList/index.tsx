import {
    useCallback,
    useMemo,
} from 'react';
import { useNavigate } from 'react-router';
import {
    Button,
    Container,
    Table,
} from '@ifrc-go/ui';
import {
    createBooleanColumn,
    createDateColumn,
    createElementColumn,
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    BlogQueryQuery,
    useBlogQueryQuery,
    useDeleteBlogMutation,
} from '#generated/types/graphql';

import styles from './styles.module.css';

type EventListItem = NonNullable<BlogQueryQuery['blogs']>['results'][number];

function BlogList() {
    const navigate = useNavigate();
    const [{ fetching, data }, reexecuteQuery] = useBlogQueryQuery();
    const [{ fetching: deletePending }, deleteBlog] = useDeleteBlogMutation();
    const tableData = data?.blogs?.results.map((blog, i) => ({ ...blog, sn: i + 1 }));

    const handleDelete = useCallback(
        (id: string, closeModal: () => void) => {
            deleteBlog({ id }).then((resp) => {
                if (resp.data?.deleteBlog) {
                    reexecuteQuery();
                    closeModal();
                }
            });
        },
        [deleteBlog, reexecuteQuery],
    );
    const columns = useMemo(
        () => ([
            // Serial Number
            createNumberColumn<EventListItem & { sn: number }, string | number>(
                'sn',
                'S.N.',
                (item) => item.sn,
                { columnWidth: 60 },
            ),
            // Title
            createStringColumn<EventListItem, string | number>(
                'title',
                'Title',
                (blog) => blog.title,
                {
                    sortable: true,
                },
            ),

            // Published Date
            createDateColumn<EventListItem, string | number>(
                'publishedDate',
                'Published Date',
                (blog) => blog.publishedDate,
                {
                    sortable: true,
                },
            ),

            // Author
            createStringColumn<EventListItem, string | number>(
                'author',
                'Author',
                (blog) => blog.author,
                {
                    sortable: true,
                },
            ),

            // Featured
            createBooleanColumn<EventListItem, string | number>(
                'featured',
                'Featured',
                (blog) => blog.featured,
                {
                    sortable: true,
                },
            ),

            // Status
            createStringColumn<EventListItem, string | number>(
                'status',
                'Status',
                (blog) => blog.status,
                {
                    sortable: true,
                },
            ),

            createElementColumn<EventListItem, string | number, TableActionsProps>(
                'actions',
                'Actions',
                TableActions,
                (_, datum) => ({
                    id: datum.id,
                    handleConfirmButtonChange: handleDelete,
                    confirmPending: deletePending,
                }),
                {
                    columnWidth: 150,
                },
            ),

        ]),
        [handleDelete, deletePending],
    );

    return (
        <Container
            className={styles.blog}
            heading="Blog"
            actions={(
                <Button name={undefined} variant="primary" disabled={false} onClick={() => navigate('add')}>
                    Add blogs
                </Button>
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

export default BlogList;
