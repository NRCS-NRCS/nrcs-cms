import {
    useCallback,
    useEffect,
    useRef,
} from 'react';

function useDebounce<Args extends unknown[]>(
    fn: (...args: Args) => void,
    delay: number,
) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        },
        [],
    );

    return useCallback(
        (...args: Args) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                fn(...args);
            }, delay);
        },
        [fn, delay],
    );
}

export default useDebounce;
