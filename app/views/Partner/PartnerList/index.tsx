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
import { isDefined } from '@togglecorp/fujs';
import { useQuery } from 'urql';

import EditDeleteActions, { type EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    type PartnerFilter,
    type PartnerQuery,
    useDeletePartnerMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    getMutationErrorMessage,
    idSelector,
} from '#utils/common';

import PartnerListFilter, { type PartnerFilterUIType } from '../PartnerListFilters';
import { PARTNER_QUERY } from '../query';

type PartnerListItem = NonNullable<PartnerQuery['partners']>['results'][number] & { no: number };

type PartnerQueryVariables = {
    pagination?: { limit: number; offset: number };
    filters?: PartnerFilter | null;
};

const defaultFilter: PartnerFilterUIType = {
    scope: undefined,
    search: undefined,
};

function PartnerList() {
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

    const queryVariables = useMemo<PartnerQueryVariables>(() => ({
        filters: {
            scope: filter.scope !== undefined ? { exact: filter.scope } : undefined,
            search: filter.search || undefined,
        },
        pagination: {
            limit,
            offset,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useQuery<PartnerQuery, PartnerQueryVariables>({
        query: PARTNER_QUERY,
        variables: queryVariables,
    });

    const [, deletePartner] = useDeletePartnerMutation();

    const tableData = useMemo(
        () => (data?.partners.results ?? []).map((item, index) => ({
            ...item,
            no: offset + index + 1,
        })),
        [data, offset],
    );

    const onDelete = useCallback(
        (id: string) => {
            deletePartner({ id }).then((resp) => {
                // NOTE: The mutation resolves to a union of the deleted node and
                // OperationInfo. Both are truthy, so failures have to be matched.
                const deleteError = resp.error
                    ? errorMessage
                    : getMutationErrorMessage(resp.data?.deletePartner);
                if (isDefined(deleteError)) {
                    alert.show(deleteError, { variant: 'danger' });
                    return;
                }
                reExecuteQuery({ requestPolicy: 'network-only' });
                alert.show('Partner deleted successfully', { variant: 'success' });
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
            });
        },
        [deletePartner, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<PartnerListItem, string | number>(
            'sn',
            'S.N.',
            (member) => String(member.no),
        ),
        createStringColumn<PartnerListItem, string | number>(
            'title',
            'Title',
            (dept) => dept.title,
        ),
        createStringColumn<PartnerListItem, string | number>(
            'scope',
            'Scope',
            (dept) => dept?.scope,
        ),
        ...(canEditContent ? [createElementColumn<PartnerListItem, string | number,
         EditDeleteActionsProps>(
             'actions',
             '',
             EditDeleteActions,
             (_, datum) => ({
                 id: datum.id,
                 onDelete,
                 itemTitle: datum.title,
                 to: 'editPartner',
             }),
         )] : []),
    ], [onDelete, canEditContent]);

    const handleAddClick = useCallback(() => {
        navigate('addPartner');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Partner"
            headerDescription="Manage NRCS partner organizations"
            headerActions={canEditContent ? (
                <Button
                    name="addPartner"
                    styleVariant="filled"
                    before={(<AddFillIcon />)}
                    onClick={handleAddClick}
                >
                    Add Partner
                </Button>
            ) : undefined}
            filters={(
                <PartnerListFilter
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.partners.totalCount ?? 0}
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

export default PartnerList;
