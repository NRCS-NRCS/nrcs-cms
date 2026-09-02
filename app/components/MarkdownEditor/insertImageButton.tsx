import {
    useCallback,
    useState,
} from 'react';
import { IoImageOutline } from 'react-icons/io5';
import {
    Button,
    IconButton,
    ListView,
    Modal,
    TextInput,
} from '@ifrc-go/ui';
import { isNotDefined } from '@togglecorp/fujs';

import FileUpload from '#components/FileUpload';
import { MAX_MARKDOWN_IMAGE_SIZE_IN_MB } from '#utils/markdownImage';

import { ACCEPTED_IMAGE_EXTENSIONS } from '../../hooks/useMdImageUpload';

import styles from './styles.module.css';

function toMarkdownTarget(url: string) {
    return /[\s()]/.test(url) ? `<${url}>` : url;
}

function buildImageMarkdown(url: string, altText: string, caption: string) {
    // Square brackets would close the alt text early.
    const alt = altText.replace(/([[\]])/g, '\\$1');
    const target = toMarkdownTarget(url);

    if (!caption) {
        return `![${alt}](${target})`;
    }

    const title = caption.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `![${alt}](${target} "${title}")`;
}

interface Props {
    onInsert: (markdown: string) => void;
    onUpload: (image: File) => Promise<string>;
}

function InsertImageButton(props: Props) {
    const { onInsert, onUpload } = props;

    const [showModal, setShowModal] = useState(false);
    const [image, setImage] = useState<File>();
    const [altText, setAltText] = useState<string | undefined>();
    const [caption, setCaption] = useState<string | undefined>();
    const [error, setError] = useState<string>();
    const [pending, setPending] = useState(false);

    const handleOpen = useCallback(() => {
        setImage(undefined);
        setAltText(undefined);
        setCaption(undefined);
        setError(undefined);
        setPending(false);
        setShowModal(true);
    }, []);

    const handleClose = useCallback(() => {
        if (pending) {
            return;
        }
        setShowModal(false);
    }, [pending]);

    const handleImageChange = useCallback((value: File | undefined) => {
        setError(undefined);
        setImage(value);
    }, []);

    const handleInsert = useCallback(() => {
        if (isNotDefined(image)) {
            setError('Choose an image to upload.');
            return;
        }

        setError(undefined);
        setPending(true);

        onUpload(image).then((url) => {
            onInsert(buildImageMarkdown(url, altText?.trim() ?? '', caption?.trim() ?? ''));
            setPending(false);
            setShowModal(false);
        }).catch(() => {
            setPending(false);
        });
    }, [image, altText, caption, onUpload, onInsert]);

    return (
        <>
            <IconButton
                name={undefined}
                onClick={handleOpen}
                title="Insert image"
                ariaLabel="Insert image"
                spacing="none"
            >
                <IoImageOutline />
            </IconButton>
            {showModal && (
                <Modal
                    heading="Insert Image"
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
                                name="insert"
                                onClick={handleInsert}
                                styleVariant="filled"
                                disabled={pending}
                            >
                                {pending ? 'Uploading' : 'Insert'}
                            </Button>
                        </ListView>
                    )}
                >
                    <ListView layout="block" spacing="sm">
                        <FileUpload
                            name={undefined}
                            label="Choose Image"
                            value={image}
                            onChange={handleImageChange}
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
            )}
        </>
    );
}

export default InsertImageButton;
