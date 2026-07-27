import {
    cloneElement,
    type ComponentProps,
    type DragEvent,
    type MouseEvent,
    type ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createElementColumn } from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import DragHandleCell from './dragHandleCell';

import styles from './styles.module.css';

const EMPTY_LIST: readonly never[] = [];

type DraggableRow = ReactElement<ComponentProps<'tr'>>;

interface DropTarget {
    index: number;
    after: boolean;
}

interface HoverRect {
    top: number;
    height: number;
}

function isBelowMidpoint(rect: HoverRect, clientY: number) {
    return clientY > rect.top + (rect.height / 2);
}

/**
 * Map a (dragIndex, targetIndex, after) hover into the array index the dragged
 * item should land at, accounting for the gap left behind once it is removed.
 */
function resolveInsertionIndex(dragIndex: number, targetIndex: number, after: boolean) {
    const insertionIndex = after ? targetIndex + 1 : targetIndex;
    return dragIndex < insertionIndex ? insertionIndex - 1 : insertionIndex;
}

/** True when both lists hold the same keys in the same positions. */
function isSameOrder<DATUM, KEY>(
    a: readonly DATUM[],
    b: readonly DATUM[],
    keySelector: (item: DATUM) => KEY,
) {
    return a.length === b.length
        && a.every((item, index) => keySelector(item) === keySelector(b[index]));
}

export function createDragHandleColumn<DATUM, KEY extends string | number>(
    id = 'dragHandle',
) {
    return createElementColumn<DATUM, KEY, object>(
        id,
        '',
        DragHandleCell,
        () => ({}),
        { columnWidth: 44 },
    );
}

export type ReorderPosition = 'BEFORE' | 'AFTER';

export interface ReorderPayload<DATUM> {
    movedItem: DATUM;
    targetItem: DATUM;
    position: ReorderPosition;
}

function resolveReorder<DATUM>(
    order: readonly DATUM[],
    dragIndex: number,
    targetIndex: number,
    after: boolean,
) {
    const insertionIndex = resolveInsertionIndex(dragIndex, targetIndex, after);
    if (insertionIndex === dragIndex) {
        return undefined;
    }

    const movedItem = order[dragIndex];
    const rest = order.filter((_, index) => index !== dragIndex);

    const precedingItem = insertionIndex > 0 ? rest[insertionIndex - 1] : undefined;
    const position: ReorderPosition = isDefined(precedingItem) ? 'AFTER' : 'BEFORE';

    return {
        nextOrder: [
            ...rest.slice(0, insertionIndex),
            movedItem,
            ...rest.slice(insertionIndex),
        ],
        payload: {
            movedItem,
            targetItem: precedingItem ?? rest[insertionIndex],
            position,
        } satisfies ReorderPayload<DATUM>,
    };
}

interface Props<DATUM, KEY extends string | number> {
    data: DATUM[] | undefined;
    keySelector: (item: DATUM) => KEY;
    onReorder: (payload: ReorderPayload<DATUM>) => Promise<boolean>;
    disabled?: boolean;
    refetch: () => void;
}

interface RowModifierOptions<DATUM, KEY> {
    rowKey: KEY;
    row: ReactElement;
    datum: DATUM;
}

function useReorder<DATUM, KEY extends string | number>(props: Props<DATUM, KEY>) {
    const {
        data,
        keySelector,
        onReorder,
        disabled,
        refetch,
    } = props;

    const dragIndexRef = useRef<number | undefined>(undefined);
    const dragFromHandleRef = useRef(false);
    const [draggingIndex, setDraggingIndex] = useState<number | undefined>(undefined);
    const [dropTarget, setDropTarget] = useState<DropTarget | undefined>(undefined);
    const [reorderPending, setReorderPending] = useState(false);

    const serverData = (data ?? EMPTY_LIST) as DATUM[];
    const [orderedData, setOrderedData] = useState<DATUM[]>(serverData);

    (function syncOrderFromServer() {
        if (serverData === orderedData || isDefined(draggingIndex)) {
            return;
        }
        if (!reorderPending) {
            setOrderedData(serverData);
            return;
        }
        if (!isSameOrder(serverData, orderedData, keySelector)) {
            return;
        }
        setOrderedData(serverData);
        setReorderPending(false);
    }());

    const indexByKey = useMemo(() => {
        const map = new Map<KEY, number>();
        orderedData.forEach((item, index) => map.set(keySelector(item), index));
        return map;
    }, [orderedData, keySelector]);

    // Measured once per hovered row: the gap grows the row, so re-measuring
    // would flip the before/after decision back and forth.
    const measuredRowRef = useRef<{ index: number; rect: HoverRect } | undefined>(undefined);
    const rowsContainerRef = useRef<HTMLElement | null>(null);

    const resetDragState = useCallback(() => {
        dragIndexRef.current = undefined;
        dragFromHandleRef.current = false;
        measuredRowRef.current = undefined;
        rowsContainerRef.current = null;
        setDraggingIndex(undefined);
        setDropTarget(undefined);
    }, []);

    const getRowRect = useCallback((e: DragEvent, index: number) => {
        const cached = measuredRowRef.current;
        if (cached?.index === index) {
            return cached.rect;
        }
        const bounds = e.currentTarget.getBoundingClientRect();
        const rect: HoverRect = { top: bounds.top, height: bounds.height };
        measuredRowRef.current = { index, rect };
        return rect;
    }, []);

    const handleDrop = useCallback(
        (targetIndex: number, insertAfter: boolean) => {
            const dragIndex = dragIndexRef.current;
            resetDragState();

            if (isNotDefined(dragIndex)) {
                return;
            }

            const reorder = resolveReorder(
                orderedData,
                dragIndex,
                targetIndex,
                insertAfter,
            );
            if (isNotDefined(reorder)) {
                return;
            }

            const previousOrder = orderedData;
            setReorderPending(true);
            setOrderedData(reorder.nextOrder);

            const rollback = () => {
                setReorderPending(false);
                setOrderedData(previousOrder);
            };

            onReorder(reorder.payload).then((ok) => {
                if (!ok) {
                    rollback();
                    return;
                }
                refetch?.();
            }).catch(rollback);
        },
        [orderedData, onReorder, resetDragState, refetch],
    );

    // Row events don't fire outside the table, so listen on the document to
    // catch drops above the first / below the last row as first / last position.
    useEffect(() => {
        const tbody = rowsContainerRef.current;
        if (isNotDefined(draggingIndex) || isNotDefined(tbody)) {
            return undefined;
        }

        const resolveEdgeDropTarget = (clientY: number): DropTarget | undefined => {
            const rows = tbody.children;
            if (rows.length === 0) {
                return undefined;
            }
            if (clientY < rows[0].getBoundingClientRect().top) {
                return { index: 0, after: false };
            }
            if (clientY > rows[rows.length - 1].getBoundingClientRect().bottom) {
                return { index: rows.length - 1, after: true };
            }
            return undefined;
        };

        const handleWindowDragOver = (e: globalThis.DragEvent) => {
            const edge = resolveEdgeDropTarget(e.clientY);
            if (isNotDefined(edge)) {
                return;
            }
            e.preventDefault();
            setDropTarget((prev) => (
                prev?.index === edge.index && prev.after === edge.after ? prev : edge
            ));
        };

        const handleWindowDrop = (e: globalThis.DragEvent) => {
            const edge = resolveEdgeDropTarget(e.clientY);
            if (isNotDefined(edge)) {
                return;
            }
            e.preventDefault();
            handleDrop(edge.index, edge.after);
        };

        document.addEventListener('dragover', handleWindowDragOver);
        document.addEventListener('drop', handleWindowDrop);
        return () => {
            document.removeEventListener('dragover', handleWindowDragOver);
            document.removeEventListener('drop', handleWindowDrop);
        };
    }, [draggingIndex, handleDrop]);

    const rowModifier = useCallback(
        (options: RowModifierOptions<DATUM, KEY>) => {
            const { rowKey, row } = options;
            const index = indexByKey.get(rowKey) ?? -1;

            const isDragged = draggingIndex === index;
            const isHovered = dropTarget?.index === index;

            const isNoOp = isHovered && isDefined(draggingIndex)
                && resolveInsertionIndex(draggingIndex, index, dropTarget.after) === draggingIndex;
            const showGap = isHovered && !isDragged && !isNoOp;

            return cloneElement(row as DraggableRow, {
                draggable: true,
                className: _cs(
                    (row.props as ComponentProps<'tr'>).className,
                    styles.draggableRow,
                    isDragged && styles.draggingRow,
                    showGap && dropTarget.after && styles.gapAfter,
                    showGap && !dropTarget.after && styles.gapBefore,
                ),
                onMouseDown: (e: MouseEvent) => {
                    const target = e.target as HTMLElement | null;
                    dragFromHandleRef.current = isDefined(
                        target?.closest(`.${styles.dragHandle}`),
                    );
                },
                onDragStart: (e: DragEvent) => {
                    if (!dragFromHandleRef.current) {
                        e.preventDefault();
                        return;
                    }
                    dragIndexRef.current = index;
                    rowsContainerRef.current = e.currentTarget.parentElement;
                    setDraggingIndex(index);
                },
                onDragOver: (e: DragEvent) => {
                    e.preventDefault();
                    const after = isBelowMidpoint(getRowRect(e, index), e.clientY);
                    setDropTarget((prev) => (
                        prev?.index === index && prev.after === after
                            ? prev
                            : { index, after }
                    ));
                },
                onDrop: (e: DragEvent) => {
                    e.preventDefault();
                    handleDrop(index, isBelowMidpoint(getRowRect(e, index), e.clientY));
                },
                onDragEnd: resetDragState,
            });
        },
        [indexByKey, draggingIndex, dropTarget, getRowRect, handleDrop, resetDragState],
    );

    return {
        orderedData,
        rowModifier: disabled ? undefined : rowModifier,
    };
}

export default useReorder;
