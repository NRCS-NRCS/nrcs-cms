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
    createBooleanColumn,
    createElementColumn,
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import ContainerWrapper from '#components/ContainerWrapper';
import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    HighlightQuery,
    useDeleteHighlightMutation,
    useHighlightQuery,
} from '#generated/types/graphql';
import usePagination from '#hooks/usePagination';

type HighlightListItem = NonNullable<HighlightQuery['highlights']>['results'][number];

function HighlightList() {
    const navigate = useNavigate();

    const {
        page,
        setPage,
        pageSize,
        variables,
        getFormattedData,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useHighlightQuery({ variables });
    const [{ fetching: deletePending }, deleteHighlight] = useDeleteHighlightMutation();

    const tableData = useMemo(
        () => getFormattedData<HighlightListItem>(data?.highlights.results),
        [data, getFormattedData],
    );

    const handleDelete = useCallback(
        (id: string, closeModal: () => void) => {
            deleteHighlight({ id }).then((resp) => {
                if (resp.data?.deleteHighlight) {
                    reExecuteQuery();
                    closeModal();
                }
            });
        },
        [deleteHighlight, reExecuteQuery],
    );

    const columns = useMemo(() => [
        createNumberColumn<HighlightListItem & { sn: number }, string | number>('sn', 'S.N.', (item) => item.sn, { columnWidth: 60 }),
        createStringColumn<HighlightListItem, string | number>('heading', 'Heading', (high) => high.heading),
        createBooleanColumn<HighlightListItem, string | number>('isActive', 'Active', (high) => high?.isActive),
        createStringColumn<HighlightListItem, string | number>('createdBy', 'Created By', (high) => `${high.createdBy.firstName} ${high.createdBy.lastName}`),
        createElementColumn<HighlightListItem, string | number, TableActionsProps>(
            'actions',
            'Actions',
            TableActions,
            (_, datum) => ({
                id: datum.id,
                handleConfirmButtonChange: handleDelete,
                confirmPending: deletePending,
                itemTitle: datum.heading,
            }),
            { columnWidth: 150 },
        ),
    ], [handleDelete, deletePending]);

    return (
        <ContainerWrapper
            withPadding
            heading="Highlight"
            actions={(
                <Button name={undefined} variant="primary" disabled={false} onClick={() => navigate('add')}>
                    Add Highlight
                </Button>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.highlights.totalCount ?? 0}
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
    );
}

export default HighlightList;
