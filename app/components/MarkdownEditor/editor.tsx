import '@mdxeditor/editor/style.css';

import {
    Activity,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
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
    type CodeBlockEditorDescriptor,
    codeBlockPlugin,
    codeMirrorPlugin,
    CreateLink,
    headingsPlugin,
    imagePlugin,
    InsertCodeBlock,
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
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import useAlert from '#hooks/useAlert';
import useDebounce from '#hooks/useDebounce';
import useMdImageUpload from '#hooks/useMdImageUpload';
import { resolveMarkdownImageSrc } from '#utils/markdownImage';

import EditImageDialog from './editImageDialog';
import EmbedBlockEditor from './embedBlockEditor';
import FullScreenToggle from './fullScreenToggle';
import InsertEmbedButton from './insertEmbedButton';
import InsertImageButton from './insertImageButton';

import styles from './styles.module.css';

const codeBlockDescriptors: CodeBlockEditorDescriptor[] = [
    {
        priority: 2,
        match: (language) => language === 'embed',
        Editor: EmbedBlockEditor,
    },
];

const codeBlockLanguages = {
    '': 'Plain text',
    bash: 'Bash',
    css: 'CSS',
    html: 'HTML',
    js: 'JavaScript',
    json: 'JSON',
    jsx: 'JavaScript (React)',
    md: 'Markdown',
    python: 'Python',
    sql: 'SQL',
    ts: 'TypeScript',
    tsx: 'TypeScript (React)',
    yaml: 'YAML',
};

export interface Props<NAME> {
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
    const editorDirtyRef = useRef(false);
    const [fullScreen, setFullScreen] = useState(false);
    const [shellElement, setShellElement] = useState<HTMLDivElement | null>(null);

    const debouncedOnChange = useDebounce(onChange, 300);

    const handleEditorChange = useCallback((val: string) => {
        editorDirtyRef.current = true;
        debouncedOnChange(val, name);
    }, [debouncedOnChange, name]);

    const handlePasteCapture = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
        const { target } = event;
        if (!(target instanceof HTMLElement) || !target.isContentEditable) {
            return;
        }

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

    const handleImageUpload = useMdImageUpload();
    const handleImagePreview = useCallback(
        (source: string) => Promise.resolve(resolveMarkdownImageSrc(source)),
        [],
    );

    const insertAtCursor = useCallback((markdown: string) => {
        editorDirtyRef.current = true;
        ref.current?.focus(
            () => {
                ref.current?.insertMarkdown(markdown);
            },
            { defaultSelection: 'rootEnd' },
        );
    }, []);

    const handleInsertImage = insertAtCursor;

    const handleInsertEmbed = useCallback((markdown: string) => {
        insertAtCursor(`\n\n${markdown}\n\n`);
    }, [insertAtCursor]);

    const handleEditorError = useCallback((payload: { error: string; source: string }) => {
        // eslint-disable-next-line no-console
        console.error('[MarkdownEditor] failed to parse markdown', payload);
        alert.show(
            'Some content could not be displayed',
            {
                variant: 'danger',
                description: payload.error,
                debugMessage: payload.source,
            },
        );
    }, [alert]);

    useEffect(() => {
        if (ref.current && !editorDirtyRef.current && value) {
            ref.current.setMarkdown(value);
        }
    }, [value]);

    useEffect(() => {
        if (!fullScreen) {
            return undefined;
        }
        const { body } = document;
        const previousOverflow = body.style.overflow;
        body.style.overflow = 'hidden';
        return () => {
            body.style.overflow = previousOverflow;
        };
    }, [fullScreen]);

    useEffect(() => {
        if (!fullScreen) {
            return undefined;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key !== 'Escape') {
                return;
            }
            const { target } = event;
            if (event.defaultPrevented
                || (target instanceof HTMLElement && isDefined(target.closest('[role="dialog"]')))
            ) {
                return;
            }
            setFullScreen(false);
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [fullScreen]);

    const toolbarContents = useCallback(() => (
        <>
            <UndoRedo />
            <BoldItalicUnderlineToggles />
            <BlockTypeSelect />
            <ListsToggle />
            <CreateLink />
            <InsertImageButton
                onInsert={handleInsertImage}
                onUpload={handleImageUpload}
            />
            <InsertTable />
            <InsertCodeBlock />
            <InsertEmbedButton onInsert={handleInsertEmbed} />
            <FullScreenToggle
                expanded={fullScreen}
                onChange={setFullScreen}
            />
        </>
    ), [handleInsertEmbed, handleInsertImage, handleImageUpload, fullScreen]);

    const plugins = useMemo(() => [
        headingsPlugin(),
        codeBlockPlugin({
            codeBlockEditorDescriptors: codeBlockDescriptors,
            defaultCodeBlockLanguage: '',
        }),
        codeMirrorPlugin({ codeBlockLanguages }),
        listsPlugin({ enableOrdered: true, enableUnordered: true }),
        imagePlugin({
            imageUploadHandler: handleImageUpload,
            imagePreviewHandler: handleImagePreview,
            ImageDialog: EditImageDialog,
        }),
        linkPlugin(),
        linkDialogPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        tablePlugin(),
        markdownShortcutPlugin(),
        toolbarPlugin({
            toolbarClassName: styles.toolbar,
            toolbarContents,
        }),
    ], [toolbarContents, handleImageUpload, handleImagePreview]);

    return (
        <Container
            withBackground
            withPadding
            heading={isDefined(heading)
                ? `${heading}${withAsteriskOnHeading ? '*' : ''}`
                : undefined}
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
                    ref={setShellElement}
                    className={_cs(styles.editorShell, fullScreen && styles.fullScreen)}
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
                            overlayContainer={shellElement}
                        />
                    </div>
                </div>
            </ListView>
        </Container>
    );
}

export default memo(MarkdownEditor) as typeof MarkdownEditor;
