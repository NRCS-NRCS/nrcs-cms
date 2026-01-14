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
import Page from '#components/Page';
import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    useDeleteVacancyMutation,
    useVacancyQuery,
    VacancyQuery,
} from '#generated/types/graphql';
import usePagination from '#hooks/usePagination';

type VacancyListItem = NonNullable<VacancyQuery['jobVacancies']>['results'][number];

function VacancyList() {
    const navigate = useNavigate();
    const {
        page,
        setPage,
        pageSize,
        variables,
        getFormattedData,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useVacancyQuery({ variables });
    const [{ fetching: deletePending }, deleteVacancy] = useDeleteVacancyMutation();

    const tableData = useMemo(
        () => getFormattedData<VacancyListItem>(data?.jobVacancies.results),
        [data, getFormattedData],
    );

    const handleDelete = useCallback(
        (id: string, closeModal: () => void) => {
            deleteVacancy({ id }).then((resp) => {
                if (resp.data?.deleteJobVacancy) {
                    reExecuteQuery();
                    closeModal();
                }
            });
        },
        [deleteVacancy, reExecuteQuery],
    );

    const columns = useMemo(() => [
        createNumberColumn<VacancyListItem & { sn: number }, string | number>('sn', 'S.N.', (item) => item.sn, { columnWidth: 60 }),
        createStringColumn<VacancyListItem, string | number>('title', 'Tile', (dept) => dept.title),
        createStringColumn<VacancyListItem, string | number>('vacancyPosition', 'Vacancy Position', (dept) => dept?.position),
        createNumberColumn<VacancyListItem, string | number>('numberOfVacancies', 'Number Of Vacancies', (dept) => dept?.numberOfVacancies),
        createStringColumn<VacancyListItem, string | number>('publishedDate', 'Published Date', (dept) => dept?.publishedAt),
        createStringColumn<VacancyListItem, string | number>('expireDate', 'Expire Date', (dept) => dept?.publishedAt),
        createBooleanColumn<VacancyListItem, string | number>('archive', 'Archived', (dept) => dept?.isArchived),
        createStringColumn<VacancyListItem, string | number>('department', 'Department', (dept) => dept?.department?.title),
        createElementColumn<VacancyListItem, string | number, TableActionsProps>(
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
                heading="Vacancy"
                actions={(
                    <Button name={undefined} variant="primary" disabled={false} onClick={() => navigate('add')}>
                        Add Vacancy
                    </Button>
                )}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={data?.jobVacancies.totalCount ?? 0}
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

export default VacancyList;
