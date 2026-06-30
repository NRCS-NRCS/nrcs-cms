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
import { useQuery } from 'urql';

import EditDeleteActions, { EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    JobVacancyFilter,
    useDeleteVacancyMutation,
    VacancyQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

import { VACANCY_QUERY } from '../query';
import VacancyListFilter, { VacancyFilterUIType } from '../VacancyListFilters';

type VacancyListItem = NonNullable<VacancyQuery['jobVacancies']>['results'][number] & { no: number };

type VacancyQueryVariables = {
    pagination?: { limit: number; offset: number };
    filters?: JobVacancyFilter | null;
};

const defaultFilter: VacancyFilterUIType = {
    isArchived: undefined,
    search: undefined,
};

function VacancyList() {
    const navigate = useRouting();
    const alert = useAlert();
    const { canEditContent } = usePermissions();

    const {
        filter,
        rawFilter,
        filtered,
        setFilterField,
        page,
        setPage,
        limit,
        offset,
    } = useFilterState({
        filter: defaultFilter,
    });

    const queryVariables = useMemo<VacancyQueryVariables>(() => ({
        filters: {
            isArchived: filter.isArchived !== undefined
                ? filter.isArchived === 'true'
                : undefined,
            search: filter.search || undefined,
        },
        pagination: {
            limit,
            offset,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useQuery<VacancyQuery, VacancyQueryVariables>({
        query: VACANCY_QUERY,
        variables: queryVariables,
    });

    const [{ fetching: deletePending }, deleteVacancy] = useDeleteVacancyMutation();

    const tableData = useMemo(
        () => (data?.jobVacancies.results ?? []).map((item, index) => ({
            ...item,
            no: (page - 1) * limit + index + 1,
        })),
        [data, page, limit],
    );

    const onDelete = useCallback(
        (id: string) => {
            deleteVacancy({ id }).then((resp) => {
                if (resp.data?.deleteJobVacancy) {
                    reExecuteQuery({ requestPolicy: 'network-only' });
                    alert.show('Vacancy deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteVacancy, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<VacancyListItem, string | number>(
            'sn',
            'S.N.',
            (member) => String(member.no),
        ),
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
            (dept) => dept?.expiryDate,
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
        ...(canEditContent ? [createElementColumn<VacancyListItem, string | number,
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
        )] : []),
    ], [onDelete, deletePending, canEditContent]);

    const handleAddClick = useCallback(() => {
        navigate('addVacancy');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Vacancy"
            headerActions={canEditContent ? (
                <Button
                    name={undefined}
                    disabled={false}
                    onClick={handleAddClick}
                >
                    Add Vacancy
                </Button>
            ) : undefined}
            filters={(
                <VacancyListFilter
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.jobVacancies.totalCount ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <Table
                keySelector={idSelector}
                columns={columns}
                data={tableData}
                filtered={filtered}
                pending={fetching}
            />
        </Container>
    );
}

export default VacancyList;
