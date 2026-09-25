import {
    useCallback,
    useMemo,
} from 'react';
import { AddFillIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Table,
} from '@ifrc-go/ui';
import {
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { useQuery } from 'urql';

import EditDeleteActions, { type EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    type CecMemberFilter,
    type CecMemberQuery,
    CecMemberReorderPosition,
    useDeleteCecMemberMutation,
    useReorderCecMemberMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import usePermissions from '#hooks/usePermissions';
import useReorder, {
    createDragHandleColumn,
    type ReorderPayload,
} from '#hooks/useReorder';
import useRouting from '#hooks/useRouting';
import {
    cecMemberTypeLabels,
    errorMessage,
    getMutationErrorMessage,
    idSelector,
} from '#utils/common';

import CecMemberListFilter, { type CecMemberFilterUIType } from '../CecMemberListFilters';
import { CEC_MEMBER_QUERY } from '../query';

type CecMemberItem = NonNullable<CecMemberQuery['cecMembers']>['results'][number];
type CecMemberListItem = CecMemberItem & { no: number };

type CecMemberQueryVariables = {
    filters?: CecMemberFilter | null;
};

const defaultFilter: CecMemberFilterUIType = {
    memberType: undefined,
    search: undefined,
};

function CecMemberList() {
    const navigate = useRouting();
    const alert = useAlert();
    const { canEditContent } = usePermissions();

    const {
        rawFilter,
        filter,
        filtered,
        setFilterField,
    } = useFilterState({
        filter: defaultFilter,
    });

    const isSearching = isDefined(filter.search) && filter.search !== '';
    const dragEnabled = canEditContent && !isSearching;

    const queryVariables = useMemo<CecMemberQueryVariables>(() => ({
        filters: {
            memberType: isDefined(filter.memberType) ? { exact: filter.memberType } : undefined,
            search: filter.search || undefined,
        },
    }), [filter]);

    const [{ fetching, data }, reExecuteQuery] = useQuery<
        CecMemberQuery,
        CecMemberQueryVariables
    >({
        query: CEC_MEMBER_QUERY,
        variables: queryVariables,
    });

    const [, deleteCecMember] = useDeleteCecMemberMutation();
    const [, reorderCecMember] = useReorderCecMemberMutation();

    const refetch = useCallback(
        () => reExecuteQuery({ requestPolicy: 'network-only' }),
        [reExecuteQuery],
    );

    const handleReorder = useCallback(
        async ({ movedItem, targetItem, position }: ReorderPayload<CecMemberItem>) => {
            const resp = await reorderCecMember({
                data: {
                    movedId: movedItem.id,
                    targetId: targetItem.id,
                    position: position === 'AFTER'
                        ? CecMemberReorderPosition.After
                        : CecMemberReorderPosition.Before,
                },
            });
            if (resp.data?.reorderCecMember?.ok) {
                alert.show('Member order updated successfully', { variant: 'success' });
                return true;
            }
            alert.show(errorMessage, { variant: 'danger' });
            return false;
        },
        [reorderCecMember, alert],
    );

    const {
        orderedData,
        rowModifier,
    } = useReorder<CecMemberItem, string>({
        data: data?.cecMembers.results,
        keySelector: idSelector,
        onReorder: handleReorder,
        disabled: !dragEnabled,
        refetch,
    });

    const tableData = useMemo<CecMemberListItem[]>(
        () => orderedData.map((item, index) => ({
            ...item,
            no: index + 1,
        })),
        [orderedData],
    );

    const onDelete = useCallback(
        (id: string) => {
            deleteCecMember({ id }).then((resp) => {
                const deleteError = resp.error
                    ? errorMessage
                    : getMutationErrorMessage(resp.data?.deleteCecMember);
                if (isDefined(deleteError)) {
                    alert.show(deleteError, { variant: 'danger' });
                    return;
                }
                refetch();
                alert.show('Member deleted successfully', { variant: 'success' });
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
            });
        },
        [deleteCecMember, refetch, alert],
    );

    const columns = useMemo(() => [
        ...(dragEnabled
            ? [createDragHandleColumn<CecMemberListItem, string>()]
            : []),
        createStringColumn<CecMemberListItem, string>(
            'sn',
            'S.N.',
            (member) => String(member.no),
        ),
        createStringColumn<CecMemberListItem, string>(
            'name',
            'Name',
            (member) => member.name,
        ),
        createStringColumn<CecMemberListItem, string>(
            'memberType',
            'Type',
            (member) => cecMemberTypeLabels[member.memberType],
        ),
        createStringColumn<CecMemberListItem, string>(
            'designation',
            'Designation',
            (member) => member.designation,
        ),
        createStringColumn<CecMemberListItem, string>(
            'email',
            'Email',
            (member) => member.email,
        ),
        createStringColumn<CecMemberListItem, string>(
            'isActive',
            'Visibility',
            (member) => (member.isActive ? 'Shown' : 'Hidden'),
        ),
        ...(canEditContent
            ? [createElementColumn<CecMemberListItem, string, EditDeleteActionsProps>(
                'actions',
                '',
                EditDeleteActions,
                (_, datum) => ({
                    id: datum.id,
                    onDelete,
                    itemTitle: datum.name,
                    to: 'editCecMember',
                }),
            )] : []),
    ], [onDelete, canEditContent, dragEnabled]);

    const handleAddClick = useCallback(() => {
        navigate('addCecMember');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="CEC Members"
            headerDescription="Manage Central Executive Committee members shown on the organization structure page. Drag the handle to reorder."
            headerActions={canEditContent ? (
                <Button
                    name="addCecMember"
                    styleVariant="filled"
                    before={(<AddFillIcon />)}
                    onClick={handleAddClick}
                >
                    Add Member
                </Button>
            ) : undefined}
            filters={(
                <CecMemberListFilter
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
        >
            <Table
                keySelector={idSelector}
                columns={columns}
                data={tableData}
                filtered={filtered}
                pending={fetching && isNotDefined(data)}
                rowModifier={rowModifier}
            />
        </Container>
    );
}

export default CecMemberList;
