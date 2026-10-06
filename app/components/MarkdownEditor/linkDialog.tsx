import {
    useCallback,
    useEffect,
    useState,
} from 'react';
import {
    IoCopyOutline,
    IoUnlinkOutline,
} from 'react-icons/io5';
import { PencilLineIcon } from '@ifrc-go/icons';
import {
    Button,
    IconButton,
    ListView,
    Modal,
    TextInput,
} from '@ifrc-go/ui';
import {
    activeEditor$,
    cancelLinkEdit$,
    type EditLinkDialog,
    linkDialogState$,
    onWindowChange$,
    type PreviewLinkDialog,
    removeLink$,
    switchFromPreviewToLinkEdit$,
    updateLink$,
    useCellValues,
    usePublisher,
} from '@mdxeditor/editor';
import { isFalsyString } from '@togglecorp/fujs';

import useAlert from '#hooks/useAlert';

import styles from './styles.module.css';

interface EditFormProps {
    state: EditLinkDialog;
}

function LinkEditForm(props: EditFormProps) {
    const { state } = props;

    const updateLink = usePublisher(updateLink$);
    const cancelLinkEdit = usePublisher(cancelLinkEdit$);

    const [url, setUrl] = useState<string | undefined>(state.url);
    const [text, setText] = useState<string | undefined>(state.text);
    const [title, setTitle] = useState<string | undefined>(state.title);
    const [error, setError] = useState<string>();

    const isExistingLink = state.initialUrl !== '';

    const handleUrlChange = useCallback((value: string | undefined) => {
        setError(undefined);
        setUrl(value);
    }, []);

    const handleClose = useCallback(() => {
        cancelLinkEdit();
    }, [cancelLinkEdit]);

    const handleRemove = useCallback(() => {
        updateLink({ url: '', text, title });
    }, [updateLink, text, title]);

    const handleSave = useCallback(() => {
        const trimmedUrl = url?.trim();
        if (isFalsyString(trimmedUrl)) {
            setError('Enter a URL.');
            return;
        }
        updateLink({ url: trimmedUrl, text, title });
    }, [url, text, title, updateLink]);

    return (
        <Modal
            heading={isExistingLink ? 'Edit Link' : 'Insert Link'}
            overlayClassName={styles.dialogOverlay}
            size="sm"
            onClose={handleClose}
            footerActions={(
                <ListView spacing="xs">
                    {isExistingLink && (
                        <Button
                            name="remove"
                            onClick={handleRemove}
                            styleVariant="outline"
                        >
                            Remove Link
                        </Button>
                    )}
                    <Button
                        name="cancel"
                        onClick={handleClose}
                        styleVariant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        name="save"
                        onClick={handleSave}
                        styleVariant="filled"
                    >
                        {isExistingLink ? 'Save' : 'Insert'}
                    </Button>
                </ListView>
            )}
        >
            <ListView layout="block" spacing="sm">
                <TextInput
                    name={undefined}
                    label="URL"
                    value={url}
                    onChange={handleUrlChange}
                    error={error}
                    placeholder="https://example.com"
                    autoFocus
                />
                {state.withAnchorText && (
                    <TextInput
                        name={undefined}
                        label="Text"
                        value={text}
                        onChange={setText}
                        placeholder="Text to display for the link"
                    />
                )}
                <TextInput
                    name={undefined}
                    label="Title"
                    value={title}
                    onChange={setTitle}
                    placeholder="Optional, shown on hover"
                />
            </ListView>
        </Modal>
    );
}

interface PreviewProps {
    state: PreviewLinkDialog;
}

function LinkPreview(props: PreviewProps) {
    const { state } = props;
    const alert = useAlert();

    const switchToEdit = usePublisher(switchFromPreviewToLinkEdit$);
    const removeLink = usePublisher(removeLink$);

    const isExternal = state.url.startsWith('http');

    const handleEdit = useCallback(() => {
        switchToEdit();
    }, [switchToEdit]);

    const handleRemove = useCallback(() => {
        removeLink();
    }, [removeLink]);

    const handleCopy = useCallback(() => {
        window.navigator.clipboard.writeText(state.url).then(() => {
            alert.show('Link copied to clipboard', { variant: 'success' });
        }).catch(() => {
            alert.show('Failed to copy link', { variant: 'danger' });
        });
    }, [state.url, alert]);

    // NOTE: keep focus (and selection) in the editor while using the toolbar
    const handleMouseDown = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
    }, []);

    const { rectangle } = state;

    return (
        <div
            className={styles.linkPreview}
            style={{
                top: rectangle.top + rectangle.height + 4,
                left: rectangle.left,
            }}
            role="toolbar"
            onMouseDown={handleMouseDown}
            contentEditable={false}
        >
            <ListView spacing="xs">
                <a
                    className={styles.linkPreviewUrl}
                    href={state.url}
                    title={state.url}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noreferrer' : undefined}
                >
                    {state.url}
                </a>
                <IconButton
                    name={undefined}
                    onClick={handleEdit}
                    title="Edit link"
                    ariaLabel="Edit link"
                    spacing="none"
                >
                    <PencilLineIcon />
                </IconButton>
                <IconButton
                    name={undefined}
                    onClick={handleCopy}
                    title="Copy link"
                    ariaLabel="Copy link"
                    spacing="none"
                >
                    <IoCopyOutline />
                </IconButton>
                <IconButton
                    name={undefined}
                    onClick={handleRemove}
                    title="Remove link"
                    ariaLabel="Remove link"
                    spacing="none"
                >
                    <IoUnlinkOutline />
                </IconButton>
            </ListView>
        </div>
    );
}

function LinkDialog() {
    const [state, activeEditor] = useCellValues(linkDialogState$, activeEditor$);
    const publishWindowChange = usePublisher(onWindowChange$);

    const isPreview = state.type === 'preview';

    // NOTE: recompute the preview position when the page moves
    useEffect(() => {
        if (!isPreview) {
            return undefined;
        }
        const update = () => {
            activeEditor?.getEditorState().read(() => {
                publishWindowChange(true);
            });
        };
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [isPreview, activeEditor, publishWindowChange]);

    return (
        <>
            {state.type === 'edit' && (
                <LinkEditForm
                    key={state.linkNodeKey}
                    state={state}
                />
            )}
            {state.type === 'preview' && (
                <LinkPreview state={state} />
            )}
        </>
    );
}

export default LinkDialog;
