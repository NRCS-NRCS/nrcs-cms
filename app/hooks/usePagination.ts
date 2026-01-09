import {
    useCallback,
    useMemo,
} from 'react';
import { useSearchParams } from 'react-router';

const PAGE_SIZE = 10;

function usePagination() {
    const [searchParams, setSearchParams] = useSearchParams();
    const pageFromParams = Number(searchParams.get('page')) || 1;

    const page = pageFromParams;
    const offset = (page - 1) * PAGE_SIZE;

    const setPage = useCallback(
        (newPage: number) => {
            searchParams.set('page', String(newPage));
            setSearchParams(searchParams);
        },
        [searchParams, setSearchParams],
    );

    const variables = useMemo(
        () => ({
            pagination: {
                limit: PAGE_SIZE,
                offset,
            },
        }),
        [offset],
    );

    const getFormattedData = useCallback(
        <T extends object>(results?: T[]) => results?.map((item, index) => ({
            ...item,
            sn: offset + index + 1,
        })) ?? [],
        [offset],
    );

    return {
        page,
        setPage,
        variables,
        pageSize: PAGE_SIZE,
        getFormattedData,
    };
}

export default usePagination;
