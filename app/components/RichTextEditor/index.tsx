import '@mdxeditor/editor/style.css';

import {
    Activity,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import { InputError } from '@ifrc-go/ui';
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    CreateLink,
    headingsPlugin,
    imagePlugin,
    InsertImage,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    ListsToggle,
    markdownShortcutPlugin,
    MDXEditor,
    MDXEditorMethods,
    quotePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo,
} from '@mdxeditor/editor';

import styles from './styles.module.css';

interface Props {
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
}

function debounce<Args extends unknown[], R>(
    fn: (...args: Args) => R,
    delay: number,
): (...args: Args) => void {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args: Args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}

function ToolbarContents() {
    return (
        <>
            <UndoRedo />
            <BoldItalicUnderlineToggles />
            <BlockTypeSelect />
            <ListsToggle />
            <CreateLink />
            <InsertImage />
        </>
    );
}

export default function RichTextEditor(props: Props) {
    const {
        value = '',
        onChange,
        error,
    } = props;
    const ref = useRef<MDXEditorMethods>(null);
    const prevValueRef = useRef(value);

    const handleChange = useMemo(
        () => debounce((data: string) => {
            onChange?.(data);
        }, 300),
        [onChange],
    );

    useEffect(() => {
        if (ref.current && value !== prevValueRef.current) {
            ref.current.setMarkdown(value);
            prevValueRef.current = value;
        }
    }, [value]);

    const plugins = useMemo(() => [
        headingsPlugin(),
        listsPlugin({ enableOrdered: true, enableUnordered: true }),
        imagePlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        toolbarPlugin({
            toolbarClassName: 'my-classname',
            toolbarContents: ToolbarContents,
        }),
    ], []);

    return (
        <div className={styles.editor}>
            <MDXEditor
                markdown={value}
                ref={ref}
                onChange={handleChange}
                placeholder="Start writing here..."
                plugins={plugins}
            />
            <Activity mode={error ? 'visible' : 'hidden'}>
                <InputError>
                    {error}
                </InputError>
            </Activity>
        </div>
    );
}
