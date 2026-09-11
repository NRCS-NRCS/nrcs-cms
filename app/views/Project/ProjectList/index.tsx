import {
    useCallback,
    useMemo,
} from 'react';
import { AddFillIcon } from '@ifrc-go/icons';
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
import { isDefined } from '@togglecorp/fujs';
import { useQuery } from 'urql';

import EditDeleteActions, { type EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    type ProjectFilter,
    type ProjectQuery,
    useDeleteProjectMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    getMutationErrorMessage,
    idSelector,
} from '#utils/common';

import ProjectListFilter, { type ProjectFilterUIType } from '../ProjectListFilters';
import { PROJECT_QUERY } from '../query';

type ProjectListItem = NonNullable<ProjectQuery['projects']>['results'][number] & { no: number };

type ProjectQueryVariables = {
    pagination?: { limit: number; offset: number };
    filters?: ProjectFilter | null;
};

const defaultFilter: ProjectFilterUIType = {
    search: undefined,
};

function ProjectList() {
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

    const queryVariables = useMemo<ProjectQueryVariables>(() => ({
        filters: {
            search: filter.search || undefined,
        },
        pagination: {
            limit,
            offset,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useQuery<ProjectQuery, ProjectQueryVariables>({
        query: PROJECT_QUERY,
        variables: queryVariables,
    });

    const [, deleteProject] = useDeleteProjectMutation();

    const tableData = useMemo(
        () => (data?.projects.results ?? []).map((item, index) => ({
            ...item,
            no: offset + index + 1,
        })),
        [data, offset],
    );

    const onDelete = useCallback(
        (id: string) => {
            deleteProject({ id }).then((resp) => {
                const deleteError = resp.error
                    ? errorMessage
                    : getMutationErrorMessage(resp.data?.deleteProject);
                if (isDefined(deleteError)) {
                    alert.show(deleteError, { variant: 'danger' });
                    return;
                }
                reExecuteQuery({ requestPolicy: 'network-only' });
                alert.show('Project deleted successfully', { variant: 'success' });
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
            });
        },
        [deleteProject, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<ProjectListItem, string | number>(
            'sn',
            'S.N.',
            (member) => String(member.no),
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
        ...(canEditContent ? [createElementColumn<ProjectListItem, string | number,
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
         )] : []),
    ], [onDelete, canEditContent]);

    const handleAddClick = useCallback(() => {
        navigate('addProject');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Project"
            headerDescription="Manage NRCS projects and initiatives"
            headerActions={canEditContent ? (
                <Button
                    name="addProject"
                    styleVariant="filled"
                    before={(<AddFillIcon />)}
                    onClick={handleAddClick}
                >
                    Add Project
                </Button>
            ) : undefined}
            filters={(
                <ProjectListFilter
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.projects.totalCount ?? 0}
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

export default ProjectList;
