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
import { useQuery } from 'urql';

import EditDeleteActions, { type EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    type ResourceFilter,
    type ResourceQuery,
    useDeleteResourceMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

import { RESOURCES_QUERY } from '../query';
import ResourcesListFilter, { type ResourceFilterUIType } from '../ResourcesListFilters';

type ResourceListItem = NonNullable<ResourceQuery['resources']>['results'][number] & { no: number };

type ResourceQueryVariables = {
    pagination?: { limit: number; offset: number };
    filters?: ResourceFilter | null;
};

const defaultFilter: ResourceFilterUIType = {
    type: undefined,
    search: undefined,
};

function ResourceList() {
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

    const queryVariables = useMemo<ResourceQueryVariables>(() => ({
        filters: {
            type: filter.type ?? undefined,
            search: filter.search || undefined,
        },
        pagination: {
            limit,
            offset,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useQuery<ResourceQuery, ResourceQueryVariables>({
        query: RESOURCES_QUERY,
        variables: queryVariables,
    });

    const [, deleteResource] = useDeleteResourceMutation();

    const tableData = useMemo(
        () => (data?.resources.results ?? []).map((item, index) => ({
            ...item,
            no: (page - 1) * limit + index + 1,
        })),
        [data, page, limit],
    );

    const onDelete = useCallback(
        (id: string) => {
            deleteResource({ id }).then((resp) => {
                if (resp.data?.deleteResource) {
                    reExecuteQuery({ requestPolicy: 'network-only' });
                    alert.show('Resource deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteResource, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<ResourceListItem, string | number>(
            'sn',
            'S.N.',
            (member) => String(member.no),
        ),
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
        ...(canEditContent ? [createElementColumn<ResourceListItem, string | number,
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
         )] : []),
    ], [onDelete, canEditContent]);

    const handleAddClick = useCallback(() => {
        navigate('addResources');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Resource"
            headerDescription="Manage downloadable resources and documents"
            headerActions={canEditContent ? (
                <Button
                    name="addResources"
                    styleVariant="filled"
                    before={(<AddFillIcon />)}
                    onClick={handleAddClick}
                >
                    Add Resource
                </Button>
            ) : undefined}
            filters={(
                <ResourcesListFilter
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.resources.totalCount ?? 0}
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

export default ResourceList;
