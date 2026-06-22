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
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import EditDeleteActions, { EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    ProjectQuery,
    useDeleteProjectMutation,
    useProjectQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

type ProjectListItem = NonNullable<ProjectQuery['projects']>['results'][number];

function ProjectList() {
    const navigate = useRouting();
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
        () => data?.projects.results ?? [],
        [data],
    );

    const onDelete = useCallback(
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
        createStringColumn<ProjectListItem, string | number>(
            'sn',
            'S.N.',
            (member) => String(tableData.indexOf(member) + 1),
        ),
        createStringColumn<ProjectListItem, string | number>(
            'title',
            'Title',
            (dept) => dept.title,
        ),
        createStringColumn<ProjectListItem, string | number>(
            'department',
            'Department',
            (dept) => dept?.department?.title,
        ),
        createElementColumn<ProjectListItem, string | number,
         EditDeleteActionsProps>(
             'actions',
             '',
             EditDeleteActions,
             (_, datum) => ({
                 id: datum.id,
                 onDelete,
                 itemTitle: datum.title,
                 to: 'editProject',
             }),
         ),
    ], [onDelete, tableData]);

    const handleAddClick = useCallback(() => {
        navigate('addProject');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Project"
            headerActions={(
                <Button
                    name={undefined}
                    disabled={false}
                    onClick={handleAddClick}
                >
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
