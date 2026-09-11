import {
    useCallback,
    useState,
} from 'react';
import {
    Button,
    ListView,
    Modal,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { isFalsyString } from '@togglecorp/fujs';

import {
    HORIZONTAL,
    inferOrientation,
    isSupportedEmbedUrl,
    type Orientation,
    type ParsedEmbed,
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

export interface EmbedValue {
    url: string;
    orientation: Orientation;
    caption: string | undefined;
}

interface Props {
    heading: string;
    submitLabel: string;
    initialValue?: ParsedEmbed;
    onSubmit: (value: EmbedValue) => void;
    onClose: () => void;
}

/**
 * The insert and edit flows ask for exactly the same three fields, so they share
 * this dialog. Mount it keyed on whatever it is editing: the initial values are
 * read once, on mount, rather than synced in an effect.
 */
function EmbedDialog(props: Props) {
    const {
        heading,
        submitLabel,
        initialValue,
        onSubmit,
        onClose,
    } = props;

    const [url, setUrl] = useState<string | undefined>(initialValue?.url);
    const [orientation, setOrientation] = useState<OrientationChoice | undefined>(
        initialValue?.orientation ?? AUTO,
    );
    const [caption, setCaption] = useState<string | undefined>(initialValue?.caption);
    const [error, setError] = useState<string>();

    const handleUrlChange = useCallback((value: string | undefined) => {
        setError(undefined);
        setUrl(value);
    }, []);

    const handleSubmit = useCallback(() => {
        const trimmedUrl = url?.trim();
        if (isFalsyString(trimmedUrl)) {
            setError('Enter a video URL.');
            return;
        }
        if (!isSupportedEmbedUrl(trimmedUrl)) {
            setError('Only YouTube and Facebook video, reel or short URLs are supported.');
            return;
        }

        onSubmit({
            url: trimmedUrl,
            orientation: orientation === AUTO || !orientation
                ? inferOrientation(trimmedUrl)
                : orientation,
            caption: caption?.trim() || undefined,
        });
    }, [url, orientation, caption, onSubmit]);

    return (
        <Modal
            heading={heading}
            overlayClassName={styles.dialogOverlay}
            size="sm"
            onClose={onClose}
            footerActions={(
                <ListView spacing="xs">
                    <Button
                        name="cancel"
                        onClick={onClose}
                        styleVariant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        name="submit"
                        onClick={handleSubmit}
                        styleVariant="filled"
                    >
                        {submitLabel}
                    </Button>
                </ListView>
            )}
        >
            <ListView layout="block" spacing="sm">
                <TextInput
                    name={undefined}
                    label="Video URL"
                    value={url}
                    onChange={handleUrlChange}
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
    );
}

export default EmbedDialog;
