import {
    useCallback,
    useState,
} from 'react';
import {
    Button,
    Image,
    ListView,
    Modal,
    TextInput,
} from '@ifrc-go/ui';
import {
    closeImageDialog$,
    type EditingImageDialogState,
    imageDialogState$,
    saveImage$,
    useCellValues,
    usePublisher,
} from '@mdxeditor/editor';
import { isDefined } from '@togglecorp/fujs';

import FileUpload from '#components/FileUpload';
import {
    MAX_MARKDOWN_IMAGE_SIZE_IN_MB,
    resolveMarkdownImageSrc,
} from '#utils/markdownImage';

import useImageUpload, { ACCEPTED_IMAGE_EXTENSIONS } from '../../hooks/useMdImageUpload';

import styles from './styles.module.css';

interface Props {
    state: EditingImageDialogState;
}

function EditImageForm(props: Props) {
    const { state } = props;

    const saveImage = usePublisher(saveImage$);
    const closeImageDialog = usePublisher(closeImageDialog$);
    const uploadImage = useImageUpload();

    const currentSrc = state.initialValues.src;

    const [replacement, setReplacement] = useState<File>();
    // Undefined-able because TextInput clears to undefined, not ''.
    const [altText, setAltText] = useState<string | undefined>(state.initialValues.altText ?? '');
    const [caption, setCaption] = useState<string | undefined>(state.initialValues.title ?? '');
    const [error, setError] = useState<string>();
    const [pending, setPending] = useState(false);

    const handleClose = useCallback(() => {
        if (pending) {
            return;
        }
        closeImageDialog();
    }, [pending, closeImageDialog]);

    const handleReplacementChange = useCallback((value: File | undefined) => {
        setError(undefined);
        setReplacement(value);
    }, []);

    const handleSave = useCallback(() => {
        const save = (src: string) => {
            if (!src) {
                setError('This image has no source to save.');
                return;
            }
            saveImage({
                src,
                altText: altText?.trim() ?? '',
                title: caption?.trim() ?? '',
            });
        };

        if (isDefined(replacement)) {
            setPending(true);
            uploadImage(replacement).then((url) => {
                setPending(false);
                save(url);
            }).catch(() => {
                setPending(false);
            });
            return;
        }

        save(currentSrc ?? '');
    }, [replacement, currentSrc, altText, caption, uploadImage, saveImage]);

    return (
        <Modal
            heading="Edit Image"
            overlayClassName={styles.dialogOverlay}
            size="sm"
            onClose={handleClose}
            footerActions={(
                <ListView spacing="xs">
                    <Button
                        name="cancel"
                        onClick={handleClose}
                        styleVariant="outline"
                        disabled={pending}
                    >
                        Cancel
                    </Button>
                    <Button
                        name="save"
                        onClick={handleSave}
                        styleVariant="filled"
                        disabled={pending}
                    >
                        {pending ? 'Uploading' : 'Save'}
                    </Button>
                </ListView>
            )}
        >
            <ListView layout="block" spacing="sm">
                {isDefined(currentSrc) && (
                    <Image
                        src={resolveMarkdownImageSrc(currentSrc)}
                        alt={altText || 'Current image'}
                        withContainedFit
                        size="lg"
                    />
                )}
                <FileUpload
                    name={undefined}
                    label="Replace Image"
                    value={replacement}
                    onChange={handleReplacementChange}
                    error={error}
                    accept={ACCEPTED_IMAGE_EXTENSIONS}
                    maxFileSizeInMb={MAX_MARKDOWN_IMAGE_SIZE_IN_MB}
                />
                <TextInput
                    name={undefined}
                    label="Alt Text"
                    value={altText}
                    onChange={setAltText}
                    placeholder="Describes the image for screen readers"
                />
                <TextInput
                    name={undefined}
                    label="Caption"
                    value={caption}
                    onChange={setCaption}
                    placeholder="Optional caption"
                />
            </ListView>
        </Modal>
    );
}

/**
 * Replaces mdxeditor's built-in image dialog (the settings button on a selected
 * image) so editing an image looks like inserting one. The built-in asks for a
 * raw URL; this uploads instead, and keeps the existing URL unless a
 * replacement is chosen.
 *
 * The form is keyed on the node so opening the dialog on a different image
 * remounts it with that image's values, rather than syncing them in an effect.
 */
function EditImageDialog() {
    const [state] = useCellValues(imageDialogState$);

    if (state.type !== 'editing') {
        return null;
    }

    return (
        <EditImageForm
            key={state.nodeKey}
            state={state}
        />
    );
}

export default EditImageDialog;
