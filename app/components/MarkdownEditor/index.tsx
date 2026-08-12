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
    Container,
    Description,
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
    type MDXEditorMethods,
    quotePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo,
} from '@mdxeditor/editor';
import { isDefined } from '@togglecorp/fujs';

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
        heading,
        headingDescription,
        placeholder = 'Start writing here...',
        error,
        withAsteriskOnHeading,
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
                <div className={styles.editor}>
                    <MDXEditor
                        markdown={value}
                        ref={ref}
                        onChange={handleEditorChange}
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
