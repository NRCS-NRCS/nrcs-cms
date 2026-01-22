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
    createElementColumn,
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import ContainerWrapper from '#components/ContainerWrapper';
import Page from '#components/Page';
import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    ResourceQuery,
    useDeleteResourceMutation,
    useResourceQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';

type ResourceListItem = NonNullable<ResourceQuery['resources']>['results'][number];

function ResourceList() {
    const navigate = useNavigate();
    const alert = useAlert();

    const {
        page,
        setPage,
        pageSize,
        variables,
        getFormattedData,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useResourceQuery({ variables });
    const [{ fetching: deletePending }, deleteResource] = useDeleteResourceMutation();

    const tableData = useMemo(
        () => getFormattedData<ResourceListItem>(data?.resources.results),
        [data, getFormattedData],
    );

    const handleDelete = useCallback(
        (id: string, closeModal: () => void) => {
            deleteResource({ id }).then((resp) => {
                if (resp.data?.deleteResource) {
                    reExecuteQuery();
                    closeModal();
                    alert.show('Resource deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteResource, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createNumberColumn<ResourceListItem & { sn: number }, string | number>('sn', 'S.N.', (item) => item.sn, { columnWidth: 60 }),
        createStringColumn<ResourceListItem, string | number>('title', 'Title', (dept) => dept.title),
        createStringColumn<ResourceListItem, string | number>('directive', 'Strategic Directive', (dept) => dept?.directive.title),
        createStringColumn<ResourceListItem, string | number>('type', 'Type', (dept) => dept?.type),
        createStringColumn<ResourceListItem, string | number>('publishedDate', 'Published Date', (dept) => dept?.publishedDate),
        createElementColumn<ResourceListItem, string | number, TableActionsProps>(
            'actions',
            'Actions',
            TableActions,
            (_, datum) => ({
                id: datum.id,
                handleConfirmButtonChange: handleDelete,
                confirmPending: deletePending,
                itemTitle: datum.title,
            }),
            { columnWidth: 150 },
        ),
    ], [handleDelete, deletePending]);
    return (
        <Page>
            <ContainerWrapper
                withPadding
                heading="Resource"
                actions={(
                    <Button name={undefined} variant="primary" disabled={false} onClick={() => navigate('add')}>
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
                    keySelector={(item) => item.id}
                    columns={columns}
                    data={tableData}
                    filtered={false}
                    pending={fetching}
                />
            </ContainerWrapper>
        </Page>
    );
}

export default ResourceList;
