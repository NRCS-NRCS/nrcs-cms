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
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import { useQuery } from 'urql';

import EditDeleteActions, { EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    FaqQuery,
    useDeleteFaqMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

import FAQsListFilter, { FAQsFilterUIType } from '../FAQsListFilters';
import { FAQ_QUERY } from '../query';

type FaqListItem = NonNullable<FaqQuery['faqs']>['results'][number] & { no: number };

type FAQsQueryVariables = {
    pagination?: { limit: number; offset: number };
    filters?: { search?: string | null } | null;
};

const defaultFilter: FAQsFilterUIType = {
    search: undefined,
};

function FAQsList() {
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

    const queryVariables = useMemo<FAQsQueryVariables>(() => ({
        filters: {
            search: filter.search || undefined,
        },
        pagination: {
            limit,
            offset,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useQuery<FaqQuery, FAQsQueryVariables>({
        query: FAQ_QUERY,
        variables: queryVariables,
    });

    const [, deleteFaq] = useDeleteFaqMutation();

    const tableData = useMemo(
        () => (data?.faqs.results ?? []).map((item, index) => ({
            ...item,
            no: (page - 1) * limit + index + 1,
        })),
        [data, page, limit],
    );

    const onDelete = useCallback(
        (id: string) => {
            deleteFaq({ id }).then((resp) => {
                if (resp.data?.deleteFaq) {
                    reExecuteQuery({ requestPolicy: 'network-only' });
                    alert.show('FAQ deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteFaq, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<FaqListItem, string | number>(
            'sn',
            'S.N.',
            (member) => String(member.no),
        ),
        createStringColumn<FaqListItem, string | number>(
            'question',
            'Question',
            (faq) => faq.question,
        ),
        createStringColumn<FaqListItem, string | number>(
            'answer',
            'Answer',
            (faq) => faq?.answer,
        ),
        createNumberColumn<FaqListItem, string | number>(
            'orderIndex',
            'Order Index',
            (faq) => faq.orderIndex,
        ),
        ...(canEditContent
            ? [createElementColumn<FaqListItem, string | number, EditDeleteActionsProps>(
                'actions',
                '',
                EditDeleteActions,
                (_, datum) => ({
                    id: datum.id,
                    onDelete,
                    itemTitle: datum.question,
                    to: 'editFaq',
                }),
                { columnWidth: 150 },
            )] : []),
    ], [onDelete, canEditContent]);

    const handleAddClick = useCallback(() => {
        navigate('addFaq');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="FAQs"
            headerDescription="Browse and manage frequently asked questions"
            headerActions={canEditContent ? (
                <Button
                    name="addFaq"
                    styleVariant="filled"
                    before={(<AddFillIcon />)}
                    onClick={handleAddClick}
                >
                    Add FAQs
                </Button>
            ) : undefined}
            filters={(
                <FAQsListFilter
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.faqs.totalCount ?? 0}
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

export default FAQsList;
