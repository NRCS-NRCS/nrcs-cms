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
    DepartmentsQuery,
    useDeleteDepartmentMutation,
    useDepartmentsQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import { idSelector } from '#utils/common';

type EventListItem = NonNullable<DepartmentsQuery['departments']>['results'][number];

function DepartmentList() {
    const navigate = useNavigate();
    const alert = useAlert();

    const {
        page,
        setPage,
        pageSize,
        variables,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useDepartmentsQuery({ variables });
    const [, deleteDepartment] = useDeleteDepartmentMutation();

    const tableData = data?.departments.results;

    const handleDelete = useCallback(
        (id: string) => {
            deleteDepartment({ id }).then((resp) => {
                if (resp.data?.deleteDepartment) {
                    reExecuteQuery();
                    alert.show('Department deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteDepartment, reExecuteQuery, alert],
    );
    const columns = useMemo(() => [
        createStringColumn<EventListItem, string | number>('title', 'Title', (dept) => dept.title),
        createStringColumn<EventListItem, string | number>('strategicDirective', 'Strategic Directive', (dept) => dept?.strategicDirective?.title),
        createStringColumn<EventListItem, string | number>('contactPersonName', 'Contact Person Name', (dept) => dept.contactPersonName),
        createStringColumn<EventListItem, string | number>('contactPersonEmail', 'Contact Person Email', (dept) => dept.contactPersonEmail),
        createElementColumn<EventListItem, string | number, TableActionsProps>(
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
            heading="Department"
            headerActions={(
                <Button name={undefined} styleVariant="outline" disabled={false} onClick={() => navigate('add')}>
                    Add Department
                </Button>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.departments.totalCount ?? 0}
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

export default DepartmentList;
