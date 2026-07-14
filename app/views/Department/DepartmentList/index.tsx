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
    type DepartmentsQuery,
    useDeleteDepartmentMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

import DepartmentListFilter, { type DepartmentFilterUIType } from '../DepartmentListFilters';
import { DEPARTMENT_QUERY } from '../query';

type EventListItem = NonNullable<DepartmentsQuery['departments']>['results'][number] & { no: number };

type DepartmentQueryVariables = {
    pagination?: { limit: number; offset: number };
    filters?: { search?: string | null } | null;
};

const defaultFilter: DepartmentFilterUIType = {
    search: undefined,
};

function DepartmentList() {
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

    const queryVariables = useMemo<DepartmentQueryVariables>(() => ({
        filters: {
            search: filter.search || undefined,
        },
        pagination: {
            limit,
            offset,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useQuery<
        DepartmentsQuery, DepartmentQueryVariables
    >({
        query: DEPARTMENT_QUERY,
        variables: queryVariables,
    });

    const [, deleteDepartment] = useDeleteDepartmentMutation();

    const departments = useMemo(() => (
        (data?.departments?.results ?? []).map((item, index) => ({
            ...item,
            no: (page - 1) * limit + index + 1,
        }))
    ), [page, data, limit]);

    const onDelete = useCallback(
        (id: string) => {
            deleteDepartment({ id }).then((resp) => {
                if (resp.data?.deleteDepartment) {
                    reExecuteQuery({ requestPolicy: 'network-only' });
                    alert.show('Department deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteDepartment, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<EventListItem, string | number>(
            'sn',
            'S.N.',
            (dept) => String(dept.no),
        ),
        createStringColumn<EventListItem, string | number>(
            'title',
            'Title',
            (dept) => dept.title,
        ),
        createStringColumn<EventListItem, string | number>(
            'strategicDirective',
            'Strategic Directive',
            (dept) => dept?.strategicDirective?.title,
        ),
        createStringColumn<EventListItem, string | number>(
            'contactPersonName',
            'Contact Person Name',
            (dept) => dept.contactPersonName,
        ),
        createStringColumn<EventListItem, string | number>(
            'contactPersonEmail',
            'Contact Person Email',
            (dept) => dept.contactPersonEmail,
        ),
        ...(canEditContent
            ? [createElementColumn<EventListItem, string | number, EditDeleteActionsProps>(
                'actions',
                '',
                EditDeleteActions,
                (_, datum) => ({
                    id: datum.id,
                    onDelete,
                    itemTitle: datum.title,
                    to: 'editDepartment',
                }),
                { columnWidth: 150 },
            )] : []),
    ], [onDelete, canEditContent]);

    const handleAddClick = useCallback(() => {
        navigate('addDepartment');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Department"
            headerDescription="Manage NRCS departments and their contact information"
            headerActions={canEditContent ? (
                <Button
                    name="addDepartment"
                    styleVariant="filled"
                    before={(<AddFillIcon />)}
                    onClick={handleAddClick}
                >
                    Add Department
                </Button>
            ) : undefined}
            filters={(
                <DepartmentListFilter
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.departments.totalCount ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <Table
                keySelector={idSelector}
                columns={columns}
                data={departments}
                filtered={filtered}
                pending={fetching}
            />
        </Container>
    );
}

export default DepartmentList;
