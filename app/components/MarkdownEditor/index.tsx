import '@mdxeditor/editor/style.css';
import './prism.ts';

import {
    Activity,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import {
    Container,
    Description,
    InputError,
    ListView,
} from '@ifrc-go/ui';
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    ChangeCodeMirrorLanguage,
    ConditionalContents,
    CreateLink,
    type EditorInFocus,
    headingsPlugin,
    imagePlugin,
    InsertCodeBlock,
    InsertImage,
    InsertTable,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    ListsToggle,
    markdownShortcutPlugin,
    MDXEditor,
    type MDXEditorMethods,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo,
} from '@mdxeditor/editor';
import { isDefined } from '@togglecorp/fujs';

import useAlert from '#hooks/useAlert';
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
    heading?: string
    headingDescription?:string
    withAsteriskOnHeading?: boolean
}

function CodeBlockToolbarContents() {
    return <ChangeCodeMirrorLanguage />;
}

function DefaultToolbarContents() {
    return (
        <>
            <UndoRedo />
            <BoldItalicUnderlineToggles />
            <BlockTypeSelect />
            <ListsToggle />
            <CreateLink />
            <InsertImage />
            <InsertTable />
            <InsertCodeBlock />
        </>
    );
}

function isCodeBlockEditor(editor: EditorInFocus | null) {
    return editor?.editorType === 'codeblock';
}

function ToolbarContents() {
    return (
        <ConditionalContents
            options={[
                {
                    when: isCodeBlockEditor,
                    contents: CodeBlockToolbarContents,
                },
                {
                    fallback: DefaultToolbarContents,
                },
            ]}
        />
    );
}

function MarkdownEditor<const NAME>(props: Props<NAME>) {
    const {
        name,
        value = '',
        onChange,
        heading,
        headingDescription,
        placeholder = 'Start writing here...',
        error,
        withAsteriskOnHeading,
    } = props;
    const alert = useAlert();
    const ref = useRef<MDXEditorMethods>(null);
    // MDXEditor is uncontrolled; once the user has typed, the value prop
    // echoing back through the form must not reset the editor
    const editorDirtyRef = useRef(false);

    const debouncedOnChange = useDebounce(onChange, 300);

    const handleEditorChange = useCallback((val: string) => {
        editorDirtyRef.current = true;
        debouncedOnChange(val, name);
    }, [debouncedOnChange, name]);

    const handlePasteCapture = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
        const { clipboardData } = event;
        if (!clipboardData) {
            return;
        }
        const hasFiles = clipboardData.files.length > 0;
        const isInternalPaste = clipboardData.types.includes('application/x-lexical-editor');
        if (hasFiles || isInternalPaste) {
            return;
        }

        const text = clipboardData.getData('text/plain');
        if (text) {
            event.preventDefault();
            event.stopPropagation();
            ref.current?.insertMarkdown(text);
        }
    }, []);

    const handleEditorError = useCallback(() => (
        alert.show(
            'Some content could not be displayed',
            {
                variant: 'danger',
                description: 'Part of the content could not be parsed and may be missing from the editor.',
            },
        )), [alert]);

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
        tablePlugin(),
        markdownShortcutPlugin(),
        toolbarPlugin({
            toolbarClassName: styles.toolbar,
            toolbarContents: ToolbarContents,
        }),
    ], []);

    return (
        <Container
            withBackground
            withPadding
            heading={`${heading}${withAsteriskOnHeading ? '*' : ''}`}
            headingLevel={5}
            headerDescription={(isDefined(headingDescription)
                ? (
                    <Description withLightText>
                        {headingDescription}
                    </Description>
                ) : undefined
            )}
            footer={(
                <Activity mode={error ? 'visible' : 'hidden'}>
                    <InputError>
                        {error}
                    </InputError>
                </Activity>
            )}
        >
            <ListView
                layout="block"
                withCenteredContents
                spacing="xs"
            >
                <div
                    className={styles.editor}
                    onPasteCapture={handlePasteCapture}
                >
                    <MDXEditor
                        markdown={value}
                        ref={ref}
                        onChange={handleEditorChange}
                        onError={handleEditorError}
                        placeholder={placeholder}
                        plugins={plugins}
                        contentEditableClassName={styles.content}
                    />
                </div>
            </ListView>
        </Container>
    );
}

export default memo(MarkdownEditor) as typeof MarkdownEditor;
