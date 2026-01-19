import { useMemo } from 'react';
import {
    Pager,
    Table,
} from '@ifrc-go/ui';
import {
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import ContainerWrapper from '#components/ContainerWrapper';
import Page from '#components/Page';
import {
    UsersQuery,
    useUsersQuery,
} from '#generated/types/graphql';
import usePagination from '#hooks/usePagination';

type UsersListItem = NonNullable<UsersQuery['users']>['results'][number];

function UsersList() {
    const {
        page, setPage, pageSize, variables, getFormattedData,
    } = usePagination();

    const [{ fetching, data }] = useUsersQuery({ variables });
    const tableData = useMemo(
        () => getFormattedData<UsersListItem>(data?.users.results),
        [data, getFormattedData],
    );

    const columns = useMemo(
        () => [
            createNumberColumn<UsersListItem & { sn: number }, string | number>(
                'sn',
                'S.N.',
                (item) => item.sn,
                { columnWidth: 60 },
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
        ],
        [],
    );
    return (
        <Page>
            <ContainerWrapper
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
            </ContainerWrapper>
        </Page>
    );
}

export default UsersList;
