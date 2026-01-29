import {
    useCallback,
    useMemo,
} from 'react';
import { useNavigate } from 'react-router';
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

import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    RadioProgramQuery,
    useDeleteRadioProgramMutation,
    useRadioProgramQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import { idSelector } from '#utils/common';

type RadioProgramListItem = NonNullable<RadioProgramQuery['radioProgram']>['results'][number];

function RadioProgramList() {
    const navigate = useNavigate();
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
        () => (data?.radioProgram.results),
        [data],
    );

    const handleDelete = useCallback(
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
        createStringColumn<RadioProgramListItem, string | number>('title', 'Title', (dept) => dept.title),
        createStringColumn<RadioProgramListItem, string | number>('publishedDate', 'Published Date', (dept) => dept?.publishedDate),
        createStringColumn<RadioProgramListItem, string | number>('type', 'Type', (dept) => dept?.type),
        createElementColumn<RadioProgramListItem, string | number, TableActionsProps>(
            'actions',
            '',
            TableActions,
            (_, datum) => ({
                id: datum.id,
                handleConfirmButtonChange: handleDelete,
                itemTitle: datum.title,
            }),
            { columnWidth: 150 },
        ),
    ], [handleDelete]);
    return (
        <Container
            withPadding
            heading="Radio Program"
            headerActions={(
                <Button name={undefined} disabled={false} onClick={() => navigate('add')}>
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
