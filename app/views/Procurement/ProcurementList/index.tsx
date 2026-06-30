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

import EditDeleteActions, { EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    ProcurementQuery,
    useDeleteProcurementMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

import ProcurementListFilter, { ProcurementFilterUIType } from '../ProcurementListFilters';
import { PROCUREMENT_QUERY } from '../query';

type ProcurementListItem = NonNullable<ProcurementQuery['procurements']>['results'][number] & { no: number };

type ProcurementQueryVariables = {
    pagination?: { limit: number; offset: number };
    filters?: { search?: string | null } | null;
};

const defaultFilter: ProcurementFilterUIType = {
    search: undefined,
};

function ProcurementList() {
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

    const queryVariables = useMemo<ProcurementQueryVariables>(() => ({
        filters: {
            search: filter.search || undefined,
        },
        pagination: {
            limit,
            offset,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useQuery<
        ProcurementQuery, ProcurementQueryVariables
    >({
        query: PROCUREMENT_QUERY,
        variables: queryVariables,
    });

    const [, deleteProcurement] = useDeleteProcurementMutation();

    const tableData = useMemo(
        () => (data?.procurements?.results ?? []).map((item, index) => ({
            ...item,
            no: (page - 1) * limit + index + 1,
        })),
        [data, page, limit],
    );

    const onDelete = useCallback(
        (id: string) => {
            deleteProcurement({ id }).then((resp) => {
                if (resp.data?.deleteProcurement) {
                    reExecuteQuery({ requestPolicy: 'network-only' });
                    alert.show('Procurement deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteProcurement, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<ProcurementListItem, string | number>(
            'sn',
            'S.N.',
            (member) => String(member.no),
        ),
        createStringColumn<ProcurementListItem, string | number>(
            'title',
            'Title',
            (item) => item.title,
        ),
        createStringColumn<ProcurementListItem, string | number>(
            'publishedDate',
            'Published Date',
            (item) => item?.publishedDate,
        ),
        createStringColumn<ProcurementListItem, string | number>(
            'expireDate',
            'Expire Date',
            (item) => item?.expiryDate,
        ),
        ...(canEditContent
            ? [createElementColumn<ProcurementListItem, string | number, EditDeleteActionsProps>(
                'actions',
                '',
                EditDeleteActions,
                (_, datum) => ({
                    id: datum.id,
                    onDelete,
                    itemTitle: datum.title,
                    to: 'editProcurements',
                }),
            )] : []),
    ], [onDelete, canEditContent]);

    const handleAddClick = useCallback(() => {
        navigate('addProcurements');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Procurement"
            headerDescription="Manage procurement notices and tenders"
            headerActions={canEditContent ? (
                <Button
                    name="addProcurements"
                    styleVariant="filled"
                    before={(<AddFillIcon />)}
                    onClick={handleAddClick}
                >
                    Add Procurement
                </Button>
            ) : undefined}
            filters={(
                <ProcurementListFilter
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.procurements.totalCount ?? 0}
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

export default ProcurementList;
