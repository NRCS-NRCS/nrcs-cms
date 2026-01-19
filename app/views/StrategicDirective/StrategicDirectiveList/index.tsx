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
    StrategicDirectiveQuery,
    useDeleteStrategicDirectiveMutation,
    useStrategicDirectiveQuery,
} from '#generated/types/graphql';
import usePagination from '#hooks/usePagination';

type StrategicDirectiveListItem = NonNullable<StrategicDirectiveQuery['strategicDirectives']>['results'][number];

function StrategicDirectiveList() {
    const navigate = useNavigate();
    const {
        page,
        setPage,
        pageSize,
        variables,
        getFormattedData,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useStrategicDirectiveQuery({ variables });
    const [{ fetching: deletePending },
        deleteStrategicDirective] = useDeleteStrategicDirectiveMutation();

    const tableData = useMemo(
        () => getFormattedData<StrategicDirectiveListItem>(data?.strategicDirectives.results),
        [data, getFormattedData],
    );

    const handleDelete = useCallback(
        (id: string, closeModal: () => void) => {
            deleteStrategicDirective({ id }).then((resp) => {
                if (resp.data?.deleteStrategicDirectives) {
                    reExecuteQuery();
                    closeModal();
                }
            });
        },
        [deleteStrategicDirective, reExecuteQuery],
    );

    const columns = useMemo(() => [
        createNumberColumn<StrategicDirectiveListItem & { sn: number }, string | number>('sn', 'S.N.', (item) => item.sn, { columnWidth: 60 }),
        createStringColumn<StrategicDirectiveListItem, string | number>('title', 'Tile', (dept) => dept.title),
        createElementColumn<StrategicDirectiveListItem, string | number, TableActionsProps>(
            'actions',
            'Actions',
            TableActions,
            (_, datum) => ({
                id: datum.id,
                handleConfirmButtonChange: handleDelete,
                confirmPending: deletePending,
                itemTitle: datum.title,
            }),
        ),
    ], [handleDelete, deletePending]);
    return (
        <Page>
            <ContainerWrapper
                withPadding
                heading="Strategic Directive"
                actions={(
                    <Button name={undefined} variant="primary" disabled={false} onClick={() => navigate('add')}>
                        Add Strategic Directive
                    </Button>
                )}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={data?.strategicDirectives.totalCount ?? 0}
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

export default StrategicDirectiveList;
