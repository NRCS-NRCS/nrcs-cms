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
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import EditDeleteActions, { EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    useDeleteVacancyMutation,
    useVacancyQuery,
    VacancyQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

type VacancyListItem = NonNullable<VacancyQuery['jobVacancies']>['results'][number];

function VacancyList() {
    const navigate = useRouting();
    const alert = useAlert();

    const {
        page,
        setPage,
        pageSize,
        variables,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useVacancyQuery({ variables });
    const [{ fetching: deletePending }, deleteVacancy] = useDeleteVacancyMutation();

    const tableData = useMemo(
        () => (data?.jobVacancies.results),
        [data],
    );

    const onDelete = useCallback(
        (id: string) => {
            deleteVacancy({ id }).then((resp) => {
                if (resp.data?.deleteJobVacancy) {
                    reExecuteQuery();
                    alert.show('Vacancy deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteVacancy, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<VacancyListItem, string | number>(
            'title',
            'Title',
            (dept) => dept.title,
        ),
        createStringColumn<VacancyListItem, string | number>(
            'vacancyPosition',
            'Vacancy Position',
            (dept) => dept?.position,
        ),
        createNumberColumn<VacancyListItem, string | number>(
            'numberOfVacancies',
            'Number Of Vacancies',
            (dept) => dept?.numberOfVacancies,
        ),
        createStringColumn<VacancyListItem, string | number>(
            'publishedDate',
            'Published Date',
            (dept) => dept?.publishedAt,
        ),
        createStringColumn<VacancyListItem, string | number>(
            'expireDate',
            'Expire Date',
            (dept) => dept?.publishedAt,
        ),
        createBooleanColumn<VacancyListItem, string | number>(
            'archive',
            'Archived',
            (dept) => dept?.isArchived,
        ),
        createStringColumn<VacancyListItem, string | number>(
            'department',
            'Department',
            (dept) => dept?.department?.title,
        ),
        createElementColumn<VacancyListItem, string | number,
        EditDeleteActionsProps>(
            'actions',
            '',
            EditDeleteActions,
            (_, datum) => ({
                id: datum.id,
                onDelete,
                confirmPending: deletePending,
                itemTitle: datum.title,
                to: 'editVacancy',
            }),
        ),
    ], [onDelete, deletePending]);

    const handleAddClick = useCallback(() => {
        navigate('addBlog');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Vacancy"
            headerActions={(
                <Button
                    name={undefined}
                    disabled={false}
                    onClick={handleAddClick}
                >
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
                keySelector={idSelector}
                columns={columns}
                data={tableData}
                filtered={false}
                pending={fetching}
            />
        </Container>
    );
}

export default VacancyList;
