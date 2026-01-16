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
    ProjectQuery,
    useDeleteProjectMutation,
    useProjectQuery,
} from '#generated/types/graphql';
import usePagination from '#hooks/usePagination';

type ProjectListItem = NonNullable<ProjectQuery['projects']>['results'][number];

function ProjectList() {
    const navigate = useNavigate();
    const {
        page,
        setPage,
        pageSize,
        variables,
        getFormattedData,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useProjectQuery({ variables });
    const [{ fetching: deletePending }, deleteProject] = useDeleteProjectMutation();

    const tableData = useMemo(
        () => getFormattedData<ProjectListItem>(data?.projects.results),
        [data, getFormattedData],
    );

    const handleDelete = useCallback(
        (id: string, closeModal: () => void) => {
            deleteProject({ id }).then((resp) => {
                if (resp.data?.deleteProject) {
                    reExecuteQuery();
                    closeModal();
                }
            });
        },
        [deleteProject, reExecuteQuery],
    );

    const columns = useMemo(() => [
        createNumberColumn<ProjectListItem & { sn: number }, string | number>('sn', 'S.N.', (item) => item.sn, { columnWidth: 60 }),
        createStringColumn<ProjectListItem, string | number>('title', 'Tile', (dept) => dept.title),
        createStringColumn<ProjectListItem, string | number>('department', 'Department', (dept) => dept?.department?.title),
        createElementColumn<ProjectListItem, string | number, TableActionsProps>(
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
                heading="Project"
                actions={(
                    <Button name={undefined} variant="primary" disabled={false} onClick={() => navigate('add')}>
                        Add Project
                    </Button>
                )}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={data?.projects.totalCount ?? 0}
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

export default ProjectList;
