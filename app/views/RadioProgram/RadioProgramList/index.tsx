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
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    RadioProgramQuery,
    useDeleteRadioProgramMutation,
    useRadioProgramQuery,
} from '#generated/types/graphql';
import usePagination from '#hooks/usePagination';

import styles from './styles.module.css';

type RadioProgramListItem = NonNullable<RadioProgramQuery['radioProgram']>['results'][number];

function RadioProgramList() {
    const navigate = useNavigate();
    const {
        page,
        setPage,
        pageSize,
        variables,
        getFormattedData,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useRadioProgramQuery({ variables });
    const [{ fetching: deletePending }, deleteRadioProgram] = useDeleteRadioProgramMutation();

    const tableData = useMemo(
        () => getFormattedData<RadioProgramListItem>(data?.radioProgram.results),
        [data, getFormattedData],
    );

    const handleDelete = useCallback(
        (id: string, closeModal: () => void) => {
            deleteRadioProgram({ id }).then((resp) => {
                if (resp.data?.deleteRadioProgram) {
                    reExecuteQuery();
                    closeModal();
                }
            });
        },
        [deleteRadioProgram, reExecuteQuery],
    );

    const columns = useMemo(() => [
        createNumberColumn<RadioProgramListItem & { sn: number }, string | number>('sn', 'S.N.', (item) => item.sn, { columnWidth: 60 }),
        createStringColumn<RadioProgramListItem, string | number>('title', 'Tile', (dept) => dept.title),
        createStringColumn<RadioProgramListItem, string | number>('publishedDate', 'Published Date', (dept) => dept?.publishedDate),
        createStringColumn<RadioProgramListItem, string | number>('type', 'Type', (dept) => dept?.type),
        createElementColumn<RadioProgramListItem, string | number, TableActionsProps>(
            'actions',
            'Actions',
            TableActions,
            (_, datum) => ({
                id: datum.id,
                handleConfirmButtonChange: handleDelete,
                confirmPending: deletePending,
                itemTitle: datum.title,
            }),
            { columnWidth: 150 },
        ),
    ], [handleDelete, deletePending]);
    return (
        <Container
            className={styles.radioProgram}
            childrenContainerClassName={styles.content}
            heading="RadioProgram"
            actions={(
                <Button name={undefined} variant="primary" disabled={false} onClick={() => navigate('add')}>
                    Add RadioProgram
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
                keySelector={(item) => item.id}
                className={styles.table}
                columns={columns}
                data={tableData}
                filtered={false}
                pending={fetching}
                headerRowClassName={styles.headerRow}
            />
        </Container>
    );
}

export default RadioProgramList;
