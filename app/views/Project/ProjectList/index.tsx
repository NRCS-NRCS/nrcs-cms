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

import Page from '#components/Page';
import TableActions, { TableActionsProps } from '#components/TableAction';
import {
    ProjectQuery,
    useDeleteProjectMutation,
    useProjectQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import { idSelector } from '#utils/common';

type ProjectListItem = NonNullable<ProjectQuery['projects']>['results'][number];

function ProjectList() {
    const navigate = useNavigate();
    const alert = useAlert();

    const {
        page,
        setPage,
        pageSize,
        variables,
    } = usePagination();

    const [{ fetching, data }, reExecuteQuery] = useProjectQuery({ variables });
    const [, deleteProject] = useDeleteProjectMutation();

    const tableData = useMemo(
        () => (data?.projects.results),
        [data],
    );

    const handleDelete = useCallback(
        (id: string) => {
            deleteProject({ id }).then((resp) => {
                if (resp.data?.deleteProject) {
                    reExecuteQuery();
                    alert.show('Project deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteProject, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<ProjectListItem, string | number>('title', 'Title', (dept) => dept.title),
        createStringColumn<ProjectListItem, string | number>('department', 'Department', (dept) => dept?.department?.title),
        createElementColumn<ProjectListItem, string | number, TableActionsProps>(
            'actions',
            '',
            TableActions,
            (_, datum) => ({
                id: datum.id,
                handleConfirmButtonChange: handleDelete,
                itemTitle: datum.title,
            }),
        ),
    ], [handleDelete]);
    return (
        <Container
            withPadding
            heading="Project"
            headerActions={(
                <Button name={undefined} disabled={false} onClick={() => navigate('add')}>
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
                keySelector={idSelector}
                columns={columns}
                data={tableData}
                filtered={false}
                pending={fetching}
            />
        </Container>
    );
}

export default ProjectList;
