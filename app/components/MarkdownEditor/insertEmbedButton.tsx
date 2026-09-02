import {
    useCallback,
    useState,
} from 'react';
import { IoVideocamOutline } from 'react-icons/io5';
import {
    Button,
    IconButton,
    ListView,
    Modal,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { isFalsyString } from '@togglecorp/fujs';

import {
    buildEmbedBlock,
    HORIZONTAL,
    inferOrientation,
    isSupportedEmbedUrl,
    type Orientation,
    VERTICAL,
} from '#utils/embed';

import styles from './styles.module.css';

const AUTO = 'auto';

type OrientationChoice = typeof AUTO | Orientation;

interface OrientationOption {
    key: OrientationChoice;
    label: string;
}

const orientationOptions: OrientationOption[] = [
    { key: AUTO, label: 'Auto (from the URL)' },
    { key: HORIZONTAL, label: 'Horizontal' },
    { key: VERTICAL, label: 'Vertical' },
];

const orientationKeySelector = (option: OrientationOption) => option.key;
const orientationLabelSelector = (option: OrientationOption) => option.label;

interface Props {
    onInsert: (markdown: string) => void;
}

function InsertEmbedButton(props: Props) {
    const { onInsert } = props;

    const [showModal, setShowModal] = useState(false);
    const [url, setUrl] = useState<string | undefined>();
    const [orientation, setOrientation] = useState<OrientationChoice | undefined>(AUTO);
    const [caption, setCaption] = useState<string | undefined>();
    const [error, setError] = useState<string>();

    const handleOpen = useCallback(() => {
        setUrl(undefined);
        setOrientation(AUTO);
        setCaption(undefined);
        setError(undefined);
        setShowModal(true);
    }, []);

    const handleClose = useCallback(() => {
        setShowModal(false);
    }, []);

    const handleInsert = useCallback(() => {
        const trimmedUrl = url?.trim();
        if (isFalsyString(trimmedUrl)) {
            setError('Enter a video URL.');
            return;
        }
        if (!isSupportedEmbedUrl(trimmedUrl)) {
            setError('Only YouTube and Facebook video, reel or short URLs are supported.');
            return;
        }

        onInsert(buildEmbedBlock({
            url: trimmedUrl,
            orientation: orientation === AUTO || !orientation
                ? inferOrientation(trimmedUrl)
                : orientation,
            caption: caption?.trim(),
        }));
        setShowModal(false);
    }, [url, orientation, caption, onInsert]);

    return (
        <>
            <IconButton
                name={undefined}
                onClick={handleOpen}
                title="Insert video embed"
                ariaLabel="Insert video embed"
                spacing="none"
            >
                <IoVideocamOutline />
            </IconButton>
            {showModal && (
                <Modal
                    heading="Insert Video"
                    overlayClassName={styles.dialogOverlay}
                    size="sm"
                    onClose={handleClose}
                    footerActions={(
                        <ListView spacing="xs">
                            <Button
                                name="cancel"
                                onClick={handleClose}
                                styleVariant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                name="insert"
                                onClick={handleInsert}
                                styleVariant="filled"
                            >
                                Insert
                            </Button>
                        </ListView>
                    )}
                >
                    <ListView layout="block" spacing="sm">
                        <TextInput
                            name={undefined}
                            label="Video URL"
                            value={url}
                            onChange={setUrl}
                            error={error}
                            placeholder="https://www.youtube.com/watch?v=..."
                            autoFocus
                        />
                        <SelectInput
                            name={undefined}
                            label="Orientation"
                            options={orientationOptions}
                            value={orientation}
                            keySelector={orientationKeySelector}
                            labelSelector={orientationLabelSelector}
                            onChange={setOrientation}
                            nonClearable
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

export default InsertEmbedButton;
