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
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import EditDeleteActions, { EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    ResourceQuery,
    useDeleteResourceMutation,
    useResourceQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

type ResourceListItem = NonNullable<ResourceQuery['resources']>['results'][number];

function ResourceList() {
    const navigate = useRouting();
    const alert = useAlert();

    const {
        page,
        setPage,
        pageSize,
        variables,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useResourceQuery({ variables });
    const [, deleteResource] = useDeleteResourceMutation();

    const tableData = useMemo(
        () => (data?.resources.results),
        [data],
    );

    const onDelete = useCallback(
        (id: string) => {
            deleteResource({ id }).then((resp) => {
                if (resp.data?.deleteResource) {
                    reExecuteQuery();
                    alert.show('Resource deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteResource, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<ResourceListItem, string | number>(
            'title',
            'Title',
            (dept) => dept.title,
        ),
        createStringColumn<ResourceListItem, string | number>(
            'directive',
            'Strategic Directive',
            (dept) => dept?.directive.title,
        ),
        createStringColumn<ResourceListItem, string | number>(
            'type',
            'Type',
            (dept) => dept?.type,
        ),
        createStringColumn<ResourceListItem, string | number>(
            'publishedDate',
            'Published Date',
            (dept) => dept?.publishedDate,
        ),
        createElementColumn<ResourceListItem, string | number,
         EditDeleteActionsProps>(
             'actions',
             '',
             EditDeleteActions,
             (_, datum) => ({
                 id: datum.id,
                 onDelete,
                 itemTitle: datum.title,
                 to: 'editResources',
             }),
         ),
    ], [onDelete]);

    const handleAddClick = useCallback(() => {
        navigate('addResources');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Resource"
            headerActions={(
                <Button
                    name={undefined}
                    disabled={false}
                    onClick={handleAddClick}
                >
                    Add Resource
                </Button>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.resources.totalCount ?? 0}
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

export default ResourceList;
