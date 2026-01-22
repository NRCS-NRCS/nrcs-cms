import {
    useCallback,
    useMemo,
} from 'react';
import { useNavigate } from 'react-router';
import {
    Button,
    Pager,
    Table,
} from '@ifrc-go/ui';
import {
    createElementColumn,
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import ContainerWrapper from '#components/ContainerWrapper';
import Page from '#components/Page';
import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    RadioProgramQuery,
    useDeleteRadioProgramMutation,
    useRadioProgramQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';

type RadioProgramListItem = NonNullable<RadioProgramQuery['radioProgram']>['results'][number];

function RadioProgramList() {
    const navigate = useNavigate();
    const alert = useAlert();

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
                    alert.show('Radio Program deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteRadioProgram, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createNumberColumn<RadioProgramListItem & { sn: number }, string | number>('sn', 'S.N.', (item) => item.sn, { columnWidth: 60 }),
        createStringColumn<RadioProgramListItem, string | number>('title', 'Title', (dept) => dept.title),
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
        <Page>
            <ContainerWrapper
                withPadding
                heading="Radio Program"
                actions={(
                    <Button name={undefined} variant="primary" disabled={false} onClick={() => navigate('add')}>
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
                    keySelector={(item) => item.id}
                    columns={columns}
                    data={tableData}
                    filtered={false}
                    pending={fetching}
                />
            </ContainerWrapper>
        </Page>
    );
}

export default RadioProgramList;
