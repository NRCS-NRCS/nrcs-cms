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
    createBooleanColumn,
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    HighlightQuery,
    useDeleteHighlightMutation,
    useHighlightQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import { idSelector } from '#utils/common';

type HighlightListItem = NonNullable<HighlightQuery['highlights']>['results'][number];

function HighlightList() {
    const navigate = useNavigate();
    const alert = useAlert();

    const {
        page,
        setPage,
        pageSize,
        variables,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useHighlightQuery({ variables });
    const [, deleteHighlight] = useDeleteHighlightMutation();

    const tableData = useMemo(
        () => (data?.highlights.results),
        [data],
    );

    const handleDelete = useCallback(
        (id: string) => {
            deleteHighlight({ id }).then((resp) => {
                if (resp.data?.deleteHighlight) {
                    reExecuteQuery();
                    alert.show('Highlight deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteHighlight, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<HighlightListItem, string | number>('heading', 'Heading', (high) => high.heading),
        createBooleanColumn<HighlightListItem, string | number>('isActive', 'Active', (high) => high?.isActive),
        createStringColumn<HighlightListItem, string | number>('createdBy', 'Created By', (high) => `${high.createdBy.firstName} ${high.createdBy.lastName}`),
        createElementColumn<HighlightListItem, string | number, TableActionsProps>(
            'actions',
            '',
            TableActions,
            (_, datum) => ({
                id: datum.id,
                handleConfirmButtonChange: handleDelete,
                itemTitle: datum.heading,
            }),
        ),
    ], [handleDelete]);

    return (
        <Container
            withPadding
            heading="Highlight"
            headerActions={(
                <Button name={undefined} styleVariant="outline" disabled={false} onClick={() => navigate('add')}>
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
                keySelector={idSelector}
                columns={columns}
                data={tableData}
                filtered={false}
                pending={fetching}
            />
        </Container>
    );
}

export default HighlightList;
