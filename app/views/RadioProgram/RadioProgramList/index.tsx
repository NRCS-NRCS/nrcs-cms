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

import EditDeleteActions, { type EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    type RadioProgramQuery,
    useDeleteRadioProgramMutation,
    useRadioProgramQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    getMutationErrorMessage,
    idSelector,
    radioProgramTypeLabels,
} from '#utils/common';

import RadioProgramListFilter, { type RadioProgramFilterUIType } from '../RadioProgramListFilters';

type RadioProgramListItem =
    NonNullable<RadioProgramQuery['radioProgram']>['results'][number] & { no: number };

const defaultFilter: RadioProgramFilterUIType = {
    type: undefined,
    search: undefined,
};

function RadioProgramList() {
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

    const queryVariables = useMemo(() => ({
        filter: {
            type: filter.type ?? undefined,
            search: filter.search || undefined,
        },
        pagination: {
            limit,
            offset,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useRadioProgramQuery({
        variables: queryVariables,
    });
    const [, deleteRadioProgram] = useDeleteRadioProgramMutation();

    const tableData = useMemo(
        () => (data?.radioProgram.results ?? []).map((item, index) => ({
            ...item,
            no: offset + index + 1,
        })),
        [data, offset],
    );

    const onDelete = useCallback(
        (id: string) => {
            deleteRadioProgram({ id }).then((resp) => {
                const deleteError = resp.error
                    ? errorMessage
                    : getMutationErrorMessage(resp.data?.deleteRadioProgram);
                if (isDefined(deleteError)) {
                    alert.show(deleteError, { variant: 'danger' });
                    return;
                }
                reExecuteQuery({ requestPolicy: 'network-only' });
                alert.show('Radio Program deleted successfully', { variant: 'success' });
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
            });
        },
        [deleteRadioProgram, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<RadioProgramListItem, string | number>(
            'sn',
            'S.N.',
            (member) => String(member.no),
        ),
        createStringColumn<RadioProgramListItem, string | number>(
            'title',
            'Title',
            (dept) => dept.title,
        ),
        createStringColumn<RadioProgramListItem, string | number>(
            'publishedDate',
            'Published Date',
            (dept) => dept?.publishedDate,
        ),
        createStringColumn<RadioProgramListItem, string | number>(
            'type',
            'Type',
            (dept) => radioProgramTypeLabels[dept.type],
        ),
        ...(canEditContent ? [createElementColumn<RadioProgramListItem, string | number,
         EditDeleteActionsProps>(
             'actions',
             '',
             EditDeleteActions,
             (_, datum) => ({
                 id: datum.id,
                 onDelete,
                 itemTitle: datum.title,
                 to: 'editRadioProgram',
             }),
         )] : []),
    ], [onDelete, canEditContent]);

    const handleAddClick = useCallback(() => {
        navigate('addRadioProgram');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Radio Program"
            headerDescription="Manage radio program episodes and content"
            headerActions={canEditContent ? (
                <Button
                    name="addRadioProgram"
                    styleVariant="filled"
                    before={(<AddFillIcon />)}
                    onClick={handleAddClick}
                >
                    Add Radio Program
                </Button>
            ) : undefined}
            filters={(
                <RadioProgramListFilter
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.radioProgram.totalCount ?? 0}
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

export default RadioProgramList;
