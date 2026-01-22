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
import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    DepartmentsQuery,
    useDeleteDepartmentMutation,
    useDepartmentsQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';

type EventListItem = NonNullable<DepartmentsQuery['departments']>['results'][number];

function DepartmentList() {
    const navigate = useNavigate();
    const alert = useAlert();

    const {
        page,
        setPage,
        pageSize,
        variables,
        getFormattedData,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useDepartmentsQuery({ variables });
    const [{ fetching: deletePending }, deleteDepartment] = useDeleteDepartmentMutation();

    const tableData = useMemo(
        () => getFormattedData<EventListItem>(data?.departments.results),
        [data, getFormattedData],
    );

    const handleDelete = useCallback(
        (id: string, closeModal: () => void) => {
            deleteDepartment({ id }).then((resp) => {
                if (resp.data?.deleteDepartment) {
                    reExecuteQuery();
                    closeModal();
                    alert.show('Department deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteDepartment, reExecuteQuery, alert],
    );
    const columns = useMemo(() => [
        createNumberColumn<EventListItem & { sn: number }, string | number>('sn', 'S.N.', (item) => item.sn, { columnWidth: 60 }),
        createStringColumn<EventListItem, string | number>('title', 'Title', (dept) => dept.title),
        createStringColumn<EventListItem, string | number>('strategicDirective', 'Strategic Directive', (dept) => dept?.strategicDirective?.title),
        createStringColumn<EventListItem, string | number>('contactPersonName', 'Contact Person Name', (dept) => dept.contactPersonName),
        createStringColumn<EventListItem, string | number>('contactPersonEmail', 'Contact Person Email', (dept) => dept.contactPersonEmail),
        createElementColumn<EventListItem, string | number, TableActionsProps>(
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
        <ContainerWrapper
            withPadding
            heading="Department"
            actions={(
                <Button name={undefined} variant="primary" disabled={false} onClick={() => navigate('add')}>
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
                keySelector={(item) => item.id}
                columns={columns}
                data={tableData}
                filtered={false}
                pending={fetching}
            />
        </ContainerWrapper>
    );
}

export default DepartmentList;
