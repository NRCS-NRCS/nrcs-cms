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
    StrategicDirectiveQuery,
    useDeleteStrategicDirectiveMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

import { STRATEGIC_DIRECTIVE_QUERY } from '../query';
import StrategicDirectiveListFilter, { StrategicDirectiveFilterUIType } from '../StrategicDirectiveListFilters';

type StrategicDirectiveListItem = NonNullable<StrategicDirectiveQuery['strategicDirectives']>['results'][number] & { no: number };

type StrategicDirectiveQueryVariables = {
    pagination?: { limit: number; offset: number };
    filters?: { search?: string | null } | null;
};

const defaultFilter: StrategicDirectiveFilterUIType = {
    search: undefined,
};

function StrategicDirectiveList() {
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

    const queryVariables = useMemo<StrategicDirectiveQueryVariables>(() => ({
        filters: {
            search: filter.search || undefined,
        },
        pagination: {
            limit,
            offset,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useQuery<
        StrategicDirectiveQuery,
        StrategicDirectiveQueryVariables
    >({
        query: STRATEGIC_DIRECTIVE_QUERY,
        variables: queryVariables,
    });

    const [, deleteStrategicDirective] = useDeleteStrategicDirectiveMutation();

    const tableData = useMemo(
        () => (data?.strategicDirectives.results ?? []).map((item, index) => ({
            ...item,
            no: (page - 1) * limit + index + 1,
        })),
        [data, page, limit],
    );

    const onDelete = useCallback(
        (id: string) => {
            deleteStrategicDirective({ id }).then((resp) => {
                if (resp.data?.deleteStrategicDirectives) {
                    reExecuteQuery({ requestPolicy: 'network-only' });
                    alert.show('Strategic Directive deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteStrategicDirective, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<StrategicDirectiveListItem, string | number>(
            'sn',
            'S.N.',
            (member) => String(member.no),
        ),
        createStringColumn<StrategicDirectiveListItem, string | number>(
            'title',
            'Title',
            (item) => item.title,
        ),
        ...(canEditContent
            ? [createElementColumn<StrategicDirectiveListItem, string | number,
                EditDeleteActionsProps>(
                    'actions',
                    '',
                    EditDeleteActions,
                    (_, datum) => ({
                        id: datum.id,
                        onDelete,
                        itemTitle: datum.title,
                        to: 'editStrategicDirectives',
                    }),
                )] : []),
    ], [onDelete, canEditContent]);

    const handleAddClick = useCallback(() => {
        navigate('addStrategicDirectives');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Strategic Directive"
            headerDescription="Manage NRCS strategic directives"
            headerActions={canEditContent ? (
                <Button
                    name="addStrategicDirectives"
                    styleVariant="filled"
                    before={(<AddFillIcon />)}
                    onClick={handleAddClick}
                >
                    Add Strategic Directive
                </Button>
            ) : undefined}
            filters={(
                <StrategicDirectiveListFilter
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.strategicDirectives.totalCount ?? 0}
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

export default StrategicDirectiveList;
