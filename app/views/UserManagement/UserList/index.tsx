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

import EditDeleteActions, { type EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    useDeleteUserMutation,
    type UserFilter as UserFilterType,
    type UsersQuery,
    useUsersQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import { errorMessage } from '#utils/common';

import UserFilter from '../UserListFilters';

type UsersListItem = NonNullable<UsersQuery['users']>['results'][number] & { no: number };

const defaultFilter: UserFilterType = {
    search: undefined,
};

function UsersList() {
    const navigate = useRouting();
    const alert = useAlert();
    const { canEditUsers } = usePermissions();

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

    const queryVariables = useMemo(() => ({
        filters: {
            isActive: true,
            search: filter.search || undefined,
        },
        pagination: {
            limit,
            offset,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useUsersQuery({ variables: queryVariables });
    const [, deleteUser] = useDeleteUserMutation();

    const pageSize = limit;

    const users = useMemo(
        () => (data?.users.results ?? []).map((item, index) => ({
            ...item,
            no: (page - 1) * pageSize + index + 1,
        })),
        [data, page, pageSize],
    );

    const onDelete = useCallback(
        (id: string) => {
            deleteUser({ data: { id } }).then((resp) => {
                if (resp.data?.deleteUser) {
                    reExecuteQuery();
                    alert.show('User has been deleted successfully', { variant: 'success' });
                }
                if (resp.error) {
                    alert.show(errorMessage, { variant: 'danger' });
                }
            });
        },
        [alert, deleteUser, reExecuteQuery],
    );
    const columns = useMemo(
        () => [
            createStringColumn<UsersListItem, string | number>(
                'sn',
                'S.N.',
                (member) => String(member.no),
            ),
            createStringColumn<UsersListItem, string | number>(
                'firstName',
                'First Name',
                (dept) => dept.firstName,
            ),
            createStringColumn<UsersListItem, string | number>(
                'lastName',
                'Last Name',
                (dept) => dept.lastName,
            ),
            createStringColumn<UsersListItem, string | number>(
                'username',
                'Username',
                (dept) => dept.username,
            ),
            createStringColumn<UsersListItem, string | number>(
                'email',
                'Email',
                (dept) => dept.email,
            ),
            createStringColumn<UsersListItem, string | number>(
                'userType',
                'User Type',
                (dept) => dept.userType,
            ),
            ...(canEditUsers ? [
                createElementColumn<UsersListItem, string | number, EditDeleteActionsProps>(
                    'actions',
                    '',
                    EditDeleteActions,
                    (_, datum) => ({
                        id: datum.id,
                        onDelete,
                        itemTitle: datum.username,
                        to: 'editUser',
                    }),
                ),
            ] : []),
        ],
        [onDelete, canEditUsers],
    );
    const handleCreateClick = useCallback(() => {
        navigate('addUser');
    }, [navigate]);
    return (
        <Container
            withPadding
            heading="Users"
            filters={(
                <UserFilter
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            headerDescription="Manage authenticated users and control access"
            headerActions={canEditUsers ? (
                <Button
                    name={undefined}
                    onClick={handleCreateClick}
                    before={(<AddFillIcon />)}
                    styleVariant="filled"
                >
                    Create
                </Button>
            ) : undefined}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.users.totalCount ?? 0}
                    maxItemsPerPage={pageSize}
                    onActivePageChange={setPage}
                />
            )}
        >
            <Table
                keySelector={(item) => item.id}
                columns={columns}
                data={users}
                filtered={filtered}
                pending={fetching}
            />
        </Container>
    );
}

export default UsersList;
