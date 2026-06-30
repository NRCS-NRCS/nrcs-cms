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

import EditDeleteActions, { EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    RadioProgramQuery,
    useDeleteRadioProgramMutation,
    useRadioProgramQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

import RadioProgramListFilter, { RadioProgramFilterUIType } from '../RadioProgramListFilters';

type RadioProgramListItem =
    NonNullable<RadioProgramQuery['radioProgram']>['results'][number] & { no: number };

const defaultFilter: RadioProgramFilterUIType = {
    type: undefined,
    search: undefined,
};

function RadioProgramList() {
    const navigate = useRouting();
    const alert = useAlert();

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
            no: (page - 1) * limit + index + 1,
        })),
        [data, page, limit],
    );

    const onDelete = useCallback(
        (id: string) => {
            deleteRadioProgram({ id }).then((resp) => {
                if (resp.data?.deleteRadioProgram) {
                    reExecuteQuery();
                    alert.show('Radio Program deleted successfully', { variant: 'success' });
                }
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
            (dept) => dept?.type,
        ),
        createElementColumn<RadioProgramListItem, string | number,
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
         ),
    ], [onDelete]);

    const handleAddClick = useCallback(() => {
        navigate('addRadioProgram');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Radio Program"
            headerDescription="Manage radio program episodes and content"
            headerActions={(
                <Button
                    name="addRadioProgram"
                    styleVariant="filled"
                    before={(<AddFillIcon />)}
                    onClick={handleAddClick}
                >
                    Add Radio Program
                </Button>
            )}
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
