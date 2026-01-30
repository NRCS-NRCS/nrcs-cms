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
    createBooleanColumn,
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import EditDeleteActions, { EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    HighlightQuery,
    useDeleteHighlightMutation,
    useHighlightQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

type HighlightListItem = NonNullable<HighlightQuery['highlights']>['results'][number];

function HighlightList() {
    const navigate = useRouting();
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

    const onDelete = useCallback(
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
        createStringColumn<HighlightListItem, string | number>(
            'heading',
            'Heading',
            (high) => high.heading,
        ),
        createBooleanColumn<HighlightListItem, string | number>(
            'isActive',
            'Active',
            (high) => high?.isActive,
        ),
        createStringColumn<HighlightListItem, string | number>(
            'createdBy',
            'Created By',
            (high) => `${high.createdBy.firstName} ${high.createdBy.lastName}`,
        ),
        createElementColumn<HighlightListItem, string | number,
        EditDeleteActionsProps>(
            'actions',
            '',
            EditDeleteActions,
            (_, datum) => ({
                id: datum.id,
                onDelete,
                itemTitle: datum.heading,
                to: 'editHighlight',
            }),
        ),
    ], [onDelete]);

    const handleAddClick = useCallback(() => {
        navigate('addHighlight');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Highlight"
            headerActions={(
                <Button
                    name={undefined}
                    styleVariant="outline"
                    disabled={false}
                    onClick={handleAddClick}
                >
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
