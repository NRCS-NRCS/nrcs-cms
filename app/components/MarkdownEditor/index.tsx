import '@mdxeditor/editor/style.css';

import {
    Activity,
    memo,
    useCallback,
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

interface Props<NAME> {
    name: NAME;
    value?: string;
    onChange: (
        value: string | undefined,
        name: NAME,
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

function MarkdownEditor<const NAME>(props: Props<NAME>) {
    const {
        name,
        value = '',
        onChange,
        placeholder = 'Start writing here...',
        error,
    } = props;

    const ref = useRef<MDXEditorMethods>(null);
    // MDXEditor is uncontrolled; once the user has typed, the value prop
    // echoing back through the form must not reset the editor
    const editorDirtyRef = useRef(false);

    const debouncedOnChange = useDebounce(onChange, 300);

    const handleEditorChange = useCallback((val: string) => {
        editorDirtyRef.current = true;
        debouncedOnChange(val, name);
    }, [debouncedOnChange, name]);

    useEffect(() => {
        if (ref.current && !editorDirtyRef.current && value) {
            ref.current.setMarkdown(value);
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
                    onChange={handleEditorChange}
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

export default memo(MarkdownEditor) as typeof MarkdownEditor;
