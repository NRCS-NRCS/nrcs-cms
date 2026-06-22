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
    RadioProgramQuery,
    useDeleteRadioProgramMutation,
    useRadioProgramQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

type RadioProgramListItem = NonNullable<RadioProgramQuery['radioProgram']>['results'][number];

function RadioProgramList() {
    const navigate = useRouting();
    const alert = useAlert();

    const {
        page,
        setPage,
        pageSize,
        variables,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useRadioProgramQuery({ variables });
    const [, deleteRadioProgram] = useDeleteRadioProgramMutation();

    const tableData = useMemo(
        () => data?.radioProgram.results ?? [],
        [data],
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
            (member) => String(tableData.indexOf(member) + 1),
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
    ], [onDelete, tableData]);

    const handleAddClick = useCallback(() => {
        navigate('addRadioProgram');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Radio Program"
            headerActions={(
                <Button
                    name={undefined}
                    disabled={false}
                    onClick={handleAddClick}
                >
                    Add Radio Program
                </Button>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.radioProgram.totalCount ?? 0}
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

export default RadioProgramList;
