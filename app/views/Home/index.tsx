import {
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import { AddFillIcon } from '@ifrc-go/icons';
import {
    Button,
    ConfirmButton,
    Container,
    Pager,
    Table,
    TextInput,
} from '@ifrc-go/ui';
import {
    createActionColumn,
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    type NewsFilter,
    type NewsQuery,
    type NewsQueryVariables,
    type NewsUpdateInput,
    StatusEnum,
    useNewsQuery,
    useUpdateNewsMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    idSelector,
    transformToFormError,
} from '#utils/common';

const MAX_HIGHLIGHTED_NEWS = 6;

type NewsListItem = NonNullable<NewsQuery['news']>['results'][number] & { no: number };

const defaultFilter: Pick<NewsFilter, 'search'> = {
    search: undefined,
};

function Home() {
    const alert = useAlert();
    const navigate = useRouting();
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

    const getQueryVariables = useCallback(
        (isHighlighted: boolean): NewsQueryVariables => ({
            pagination: isHighlighted
                ? { limit: MAX_HIGHLIGHTED_NEWS, offset: 0 }
                : { limit, offset },
            filter: {
                search: !isHighlighted ? filter.search || undefined : undefined,
                status: StatusEnum.Published,
                isHighlighted,
            },
        }),
        [limit, offset, filter.search],
    );

    const [
        { fetching: newsPending, data },
        reExecuteMainQuery,
    ] = useNewsQuery({
        variables: getQueryVariables(false),
    });

    const [
        { fetching: highlightsPending, data: highlightsData },
        reExecuteHighlightsQuery,
    ] = useNewsQuery({
        variables: getQueryVariables(true),
    });

    const [, updateNews] = useUpdateNewsMutation();

    const highlightsResults = highlightsData?.news?.results;
    const highlightLimitReached = (highlightsData?.news.totalCount ?? 0) >= MAX_HIGHLIGHTED_NEWS;

    const totalCount = data?.news?.totalCount;

    useEffect(() => {
        if (newsPending || isNotDefined(totalCount)) {
            return;
        }
        const lastPage = Math.max(1, Math.ceil(totalCount / limit));
        if (page > lastPage) {
            setPage(lastPage);
        }
    }, [totalCount, limit, page, setPage, newsPending]);

    const tableData: NewsListItem[] = useMemo(() => (
        (data?.news?.results ?? []).map((item, index) => ({
            ...item,
            no: offset + index + 1,
        }))
    ), [data, offset]);

    const highlightsTableData: NewsListItem[] = useMemo(() => (
        (highlightsResults ?? []).map((item, index) => ({
            ...item,
            no: index + 1,
        }))
    ), [highlightsResults]);

    const handleChange = useCallback((
        id: string,
        patch: Pick<NewsUpdateInput, 'isHighlighted' | 'showInPopup'>,
        successMessage: string,
        errorField: 'isHighlighted' | 'showInPopup',
    ) => {
        const item = [...tableData, ...highlightsTableData].find((news) => news.id === id);
        if (!item || !item.directiveId) {
            alert.show(errorMessage, { variant: 'danger' });
            return;
        }

        updateNews({
            pk: id,
            data: {
                content: item.content,
                directive: item.directiveId,
                ...patch,
            },
        }).then((resp) => {
            const result = resp.data?.updateNews;
            if (result?.ok) {
                reExecuteMainQuery({ requestPolicy: 'network-only' });
                reExecuteHighlightsQuery({ requestPolicy: 'network-only' });
                alert.show(successMessage, { variant: 'success' });
            } else if (isDefined(result) && isDefined(result.errors)) {
                const formError = transformToFormError(result.errors);
                const message = formError?.[errorField];
                alert.show(
                    typeof message === 'string' && message
                        ? message
                        : errorMessage,
                    { variant: 'danger' },
                );
            }
        }).catch(() => {
            alert.show(errorMessage, { variant: 'danger' });
        });
    }, [
        tableData,
        highlightsTableData,
        updateNews,
        reExecuteMainQuery,
        reExecuteHighlightsQuery,
        alert,
    ]);

    const handleAddToHighlights = useCallback((id: string) => {
        handleChange(id, { isHighlighted: true }, 'Added to highlights', 'isHighlighted');
    }, [handleChange]);

    const handleRemoveFromHighlights = useCallback((id: string) => {
        handleChange(id, { isHighlighted: false }, 'Removed from highlights', 'isHighlighted');
    }, [handleChange]);

    const handleSetPopup = useCallback((id: string) => {
        handleChange(id, { showInPopup: true }, 'Set as the homepage popup', 'showInPopup');
    }, [handleChange]);

    const handleClearPopup = useCallback((id: string) => {
        handleChange(id, { showInPopup: false }, 'Cleared the homepage popup', 'showInPopup');
    }, [handleChange]);

    const handleAddNewsClick = useCallback(() => {
        navigate('addNews');
    }, [navigate]);

    const highlightsColumns = useMemo(() => [
        createNumberColumn<NewsListItem, string | number>(
            'no',
            'No.',
            (item) => item.no,
        ),
        createStringColumn<NewsListItem, string | number>(
            'title',
            'Title',
            (item) => item.title,
        ),
        createStringColumn<NewsListItem, string | number>(
            'publishedDate',
            'Published Date',
            (item) => item.publishedDate,
        ),
        createStringColumn<NewsListItem, string | number>(
            'showInPopup',
            'Popup',
            (item) => (item.showInPopup ? 'Shown' : '-'),
        ),
        ...(canEditContent ? [createActionColumn<NewsListItem, string | number>(
            'action',
            (item) => ({
                children: (
                    <>
                        {item.showInPopup ? (
                            <Button
                                name={item.id}
                                onClick={handleClearPopup}
                                styleVariant="action"
                                title="Stop showing this news in the homepage popup"
                            >
                                Clear Popup
                            </Button>
                        ) : (
                            <Button
                                name={item.id}
                                onClick={handleSetPopup}
                                styleVariant="action"
                                title="Show this news in the homepage popup. Only one news item can be the popup, so this replaces the current one."
                            >
                                Set as Popup
                            </Button>
                        )}
                        <ConfirmButton
                            name={item.id}
                            onConfirm={handleRemoveFromHighlights}
                            styleVariant="action"
                        >
                            Remove
                        </ConfirmButton>
                    </>
                ),
            }),
        )] : []),
    ], [canEditContent, handleRemoveFromHighlights, handleSetPopup, handleClearPopup]);

    const columns = useMemo(() => [
        createNumberColumn<NewsListItem, string | number>(
            'no',
            'No.',
            (item) => item.no,
        ),
        createStringColumn<NewsListItem, string | number>(
            'title',
            'Title',
            (item) => item.title,
        ),
        createStringColumn<NewsListItem, string | number>(
            'publishedDate',
            'Published Date',
            (item) => item.publishedDate,
        ),
        ...(canEditContent ? [createActionColumn<NewsListItem, string | number>(
            'action',
            (item) => ({
                children: (
                    <Button
                        name={item.id}
                        onClick={handleAddToHighlights}
                        styleVariant="action"
                        disabled={highlightLimitReached}
                        title={highlightLimitReached
                            ? `Highlighted news should not exceed ${MAX_HIGHLIGHTED_NEWS}. Remove one to add another.`
                            : 'Add news to highlights'}
                    >
                        Add to Highlights
                    </Button>
                ),
            }),
        )] : []),
    ], [canEditContent, handleAddToHighlights, highlightLimitReached]);

    return (
        <Container
            withPadding
            heading="Home"
            headerDescription="Manage the news highlighted on the homepage"
        >
            <Container
                withPadding
                heading="Added to Highlights"
                headerDescription={`A maximum of ${MAX_HIGHLIGHTED_NEWS} highlights can be added`}
                headingLevel={4}
                empty={highlightsResults?.length === 0}
                emptyMessage="No highlights have been added."
            >
                <Table
                    filtered={false}
                    keySelector={idSelector}
                    columns={highlightsColumns}
                    data={highlightsTableData}
                    pending={highlightsPending}
                />
            </Container>

            <Container
                withPadding
                heading="News"
                headerDescription="This section shows only published news. Add and publish news articles on the News Page to display them here"
                headerActions={canEditContent ? (
                    <Button
                        name="addNews"
                        styleVariant="filled"
                        before={(<AddFillIcon />)}
                        onClick={handleAddNewsClick}
                    >
                        Add News
                    </Button>
                ) : undefined}
                filters={(
                    <TextInput
                        name="search"
                        placeholder="Search by title"
                        value={rawFilter.search}
                        onChange={setFilterField}
                    />
                )}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={totalCount ?? 0}
                        maxItemsPerPage={limit}
                        onActivePageChange={setPage}
                    />
                )}
            >
                <Table
                    filtered={filtered}
                    keySelector={idSelector}
                    columns={columns}
                    data={tableData}
                    pending={newsPending}
                />
            </Container>
        </Container>
    );
}

export default Home;
