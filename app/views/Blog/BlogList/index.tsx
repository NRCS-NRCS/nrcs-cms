import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
    DeleteBinLineIcon,
    EditTwoLineIcon,
} from '@ifrc-go/icons';
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
import { gql } from 'urql';

import {
    BlogQueryQuery,
    useBlogQueryQuery,
} from '#generated/types/graphql';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BLOG_QUERY = gql`
  query BlogQuery {
    blogs {
      title
      status
      slug
      publishedDate
      modifiedAt
      id
      featured
      directiveId
      author
      content
      coverImage {
        name
        size
        url
      }
      createdAt
      createdBy {
        firstName
        id
        lastName
      }
      modifiedBy {
        firstName
        id
        lastName
      }
    }
  }
`;
type EventListItem = NonNullable<BlogQueryQuery['blogs']>[number];

function Actions({ id }: { id: string }) {
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
                name={undefined}
                variant="tertiary"
                onClick={() => navigate(`${id}/edit`)}
            >
                <EditTwoLineIcon />
            </Button>
            <Button
                name={undefined}
                variant="tertiary"
                onClick={() => console.log('Delete', id)}
            >
                <DeleteBinLineIcon />
            </Button>
        </div>
    );
}

function BlogList() {
    const [{ fetching, data }] = useBlogQueryQuery();
    const navigate = useNavigate();
    const tableData = data?.blogs?.map((blog, i) => ({ ...blog, sn: i + 1 }));

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
                    // columnStretch: true,
                },
            ),

            // Published Date
            createDateColumn<EventListItem, string | number>(
                'publishedDate',
                'Published Date',
                (blog) => blog.publishedDate,
                {
                    sortable: true,
                    // columnWidth: 140,
                },
            ),

            // Author
            createStringColumn<EventListItem, string | number>(
                'author',
                'Author',
                (blog) => blog.author,
                {
                    sortable: true,
                    // columnWidth: 160,
                },
            ),

            // Featured
            createBooleanColumn<EventListItem, string | number>(
                'featured',
                'Featured',
                (blog) => blog.featured,
                {
                    sortable: true,
                    // columnWidth: 100,
                },
            ),

            // Status
            createStringColumn<EventListItem, string | number>(
                'status',
                'Status',
                (blog) => blog.status,
                {
                    sortable: true,
                    // columnWidth: 120,
                },
            ),

            createElementColumn<EventListItem, string | number, { id: string }>(
                'actions',
                'Actions',
                Actions,
                (_, datum) => ({
                    id: datum.id,
                }),
                {
                    columnWidth: 150,
                },
            ),

        ]),
        [],
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
