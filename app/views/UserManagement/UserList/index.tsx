import { useMemo } from 'react';
import {
    Container,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { createStringColumn } from '@ifrc-go/ui/utils';

import {
    UsersQuery,
    useUsersQuery,
} from '#generated/types/graphql';
import usePagination from '#hooks/usePagination';

type UsersListItem = NonNullable<UsersQuery['users']>['results'][number];

function UsersList() {
    const {
        page, setPage, pageSize, variables,
    } = usePagination();

    const [{ fetching, data }] = useUsersQuery({ variables });

    const tableData = useMemo(
        () => (data?.users.results),
        [data],
    );

    const columns = useMemo(
        () => [
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
        ],
        [],
    );
    return (
        <Container
            withPadding
            heading="Users"
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
                data={tableData}
                filtered={false}
                pending={fetching}
            />
        </Container>
    );
}

export default UsersList;
