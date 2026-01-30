import '@mdxeditor/editor/style.css';

import {
    Activity,
    memo,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import {
    InputError,
    ListView,
} from '@ifrc-go/ui';
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

import useDebounce from '#hooks/useDebounce';

import styles from './styles.module.css';

interface Props{
    value?: string;
    onChange: (
        value: string | undefined,
    ) => void;
    error?: string;
    placeholder?:string
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

function MarkdownEditor(props: Props) {
    const {
        value = '',
        onChange,
        placeholder = 'Start writing here...',
        error,
    } = props;

    const ref = useRef<MDXEditorMethods>(null);
    const prevValueRef = useRef(value);

    const debouncedSearch = useDebounce(onChange, 300);

    useEffect(() => {
        if (ref.current && !prevValueRef.current) {
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
        <ListView layout="block" withCenteredContents withBackground>
            <div className={styles.editor}>
                <MDXEditor
                    markdown={value}
                    ref={ref}
                    onChange={debouncedSearch}
                    placeholder={placeholder}
                    plugins={plugins}
                />
            </div>
            <Activity mode={error ? 'visible' : 'hidden'}>
                <InputError>
                    {error}
                </InputError>
            </Activity>
        </ListView>
    );
}

export default memo(MarkdownEditor);
