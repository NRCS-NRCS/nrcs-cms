import {
    useCallback,
    useMemo,
} from 'react';
import { AddFillIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Table,
} from '@ifrc-go/ui';
import {
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { useQuery } from 'urql';

import EditDeleteActions, { type EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    type FaqQuery,
    FaqReorderPosition,
    useDeleteFaqMutation,
    useReorderFaqMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import usePermissions from '#hooks/usePermissions';
import useReorder, {
    createDragHandleColumn,
    type ReorderPayload,
} from '#hooks/useReorder';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    idSelector,
} from '#utils/common';

import FAQsListFilter, { type FAQsFilterUIType } from '../FAQsListFilters';
import { FAQ_QUERY } from '../query';

import styles from './styles.module.css';

type FaqItem = NonNullable<FaqQuery['faqs']>['results'][number];
type FaqListItem = FaqItem & { no: number };

type FAQsQueryVariables = {
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
        rawFilter,
        filter,
        filtered,
        setFilterField,
    } = useFilterState({
        filter: defaultFilter,
    });

    const isSearching = isDefined(filter.search) && filter.search !== '';
    const dragEnabled = canEditContent && !isSearching;

    const queryVariables = useMemo<FAQsQueryVariables>(() => ({
        filters: {
            search: filter.search || undefined,
        },
    }), [filter]);

    const [{ fetching, data }, reExecuteQuery] = useQuery<FaqQuery, FAQsQueryVariables>({
        query: FAQ_QUERY,
        variables: queryVariables,
    });

    const [, deleteFaq] = useDeleteFaqMutation();
    const [, reorderFaq] = useReorderFaqMutation();

    const refetch = useCallback(
        () => reExecuteQuery({ requestPolicy: 'network-only' }),
        [reExecuteQuery],
    );
    const handleReorder = useCallback(
        async ({ movedItem, targetItem, position }: ReorderPayload<FaqItem>) => {
            const resp = await reorderFaq({
                data: {
                    movedId: movedItem.id,
                    targetId: targetItem.id,
                    position: position === 'AFTER'
                        ? FaqReorderPosition.After
                        : FaqReorderPosition.Before,
                },
            });
            const result = resp.data?.reorderFaq;
            if (result?.ok) {
                alert.show('FAQ order updated successfully', { variant: 'success' });
                return true;
            }
            alert.show(errorMessage, { variant: 'danger' });
            return false;
        },
        [reorderFaq, alert],
    );

    const {
        orderedData,
        rowModifier,
    } = useReorder<FaqItem, string>({
        data: data?.faqs.results,
        keySelector: idSelector,
        onReorder: handleReorder,
        disabled: !dragEnabled,
        refetch,
    });

    const tableData = useMemo<FaqListItem[]>(
        () => orderedData.map((item, index) => ({
            ...item,
            no: index + 1,
        })),
        [orderedData],
    );

    const onDelete = useCallback(
        (id: string) => {
            deleteFaq({ id }).then((resp) => {
                if (resp.data?.deleteFaq) {
                    refetch();
                    alert.show('FAQ deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteFaq, refetch, alert],
    );

    const columns = useMemo(() => [
        ...(dragEnabled
            ? [createDragHandleColumn<FaqListItem, string>()]
            : []),
        createStringColumn<FaqListItem, string>(
            'sn',
            'S.N.',
            (member) => String(member.no),
        ),
        createStringColumn<FaqListItem, string>(
            'question',
            'Question',
            (faq) => faq.question,
        ),
        createStringColumn<FaqListItem, string>(
            'answer',
            'Answer',
            (faq) => faq?.answer,
        ),
        ...(canEditContent
            ? [createElementColumn<FaqListItem, string, EditDeleteActionsProps>(
                'actions',
                '',
                EditDeleteActions,
                (_, datum) => ({
                    id: datum.id,
                    onDelete,
                    itemTitle: datum.question,
                    to: 'editFaq',
                }),
            )] : []),
    ], [onDelete, canEditContent, dragEnabled]);

    const handleAddClick = useCallback(() => {
        navigate('addFaq');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="FAQs"
            headerDescription="Browse and manage frequently asked questions. Drag the handle to reorder."
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
        >
            <Table
                cellClassName={styles.cell}
                keySelector={idSelector}
                columns={columns}
                data={tableData}
                filtered={filtered}
                pending={fetching && isNotDefined(data)}
                rowModifier={rowModifier}
                resizableColumn
            />
        </Container>
    );
}

export default FAQsList;
