import {
    Activity,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    DeleteBinLineIcon,
    UploadFillIcon,
} from '@ifrc-go/icons';
import {
    IconButton,
    Image,
    InputError,
    ListView,
    RawFileInput,
    type SingleRawFileInputProps,
} from '@ifrc-go/ui';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { type DjangoFileType } from '#generated/types/graphql';

const IMAGE_EXTENSION_REGEX = /\.(jpe?g|png|gif|webp|svg|bmp)$/i;

const BYTES_PER_MEGA_BYTE = 1024 * 1024;

// NOTE: Keep these in sync with the limits on the server (backend/utils/common.py)
const MAX_IMAGE_FILE_SIZE_IN_MB = 4;
const MAX_AUDIO_FILE_SIZE_IN_MB = 40;
const MAX_FILE_SIZE_IN_MB = 30;

function isImageFile(file: File | DjangoFileType) {
    if (file instanceof File) {
        return file.type.startsWith('image/');
    }
    return IMAGE_EXTENSION_REGEX.test(file.name);
}

function getMaxFileSizeInMb(file: File, accept: string | undefined) {
    // NOTE: The browser leaves the type empty for files it cannot resolve,
    // so we fall back to what the input accepts
    const type = file.type !== '' ? file.type : accept;

    if (type?.startsWith('image/')) {
        return MAX_IMAGE_FILE_SIZE_IN_MB;
    }
    if (type?.startsWith('audio/')) {
        return MAX_AUDIO_FILE_SIZE_IN_MB;
    }
    return MAX_FILE_SIZE_IN_MB;
}

interface Props<NAME> {
    name: NAME;
    label?: string;
    value?: File | DjangoFileType;
    accept?: string;
    error?: string;
    maxFileSizeInMb?: number;
    onChange: (value: File | undefined, name: NAME) => void;
}

function FileUpload<const NAME>(props: Props<NAME>) {
    const {
        value,
        onChange,
        name,
        accept,
        error,
        maxFileSizeInMb,
        label = 'Upload',
    } = props;

    const [fileSizeError, setFileSizeError] = useState<string>();

    const handleClearButtonClick = useCallback(() => {
        setFileSizeError(undefined);
        onChange(undefined, name);
    }, [onChange, name]);

    const handleChange = useCallback<SingleRawFileInputProps<NAME>['onChange']>((file) => {
        if (isNotDefined(file)) {
            return;
        }

        const maxSizeInMb = maxFileSizeInMb ?? getMaxFileSizeInMb(file, accept);
        if (file.size > maxSizeInMb * BYTES_PER_MEGA_BYTE) {
            setFileSizeError(`File is too large. Max file size must be less than ${maxSizeInMb} MB.`);
            return;
        }

        setFileSizeError(undefined);
        onChange(file, name);
    }, [onChange, name, accept, maxFileSizeInMb]);

    const objectUrl = useMemo(() => {
        if (value instanceof File && isImageFile(value)) {
            return URL.createObjectURL(value);
        }
        return undefined;
    }, [value]);

    useEffect(
        () => () => {
            if (isDefined(objectUrl)) {
                URL.revokeObjectURL(objectUrl);
            }
        },
        [objectUrl],
    );

    const errorMessage = fileSizeError ?? error;

    let previewUrl: string | undefined;
    if (value instanceof File) {
        previewUrl = objectUrl;
    } else if (isDefined(value) && isImageFile(value)) {
        previewUrl = value.url ?? undefined;
    }

    return (
        <>
            <ListView withWrap spacing="sm" spacingOffset={-2}>
                <RawFileInput
                    name={name}
                    onChange={handleChange}
                    accept={accept}
                    allowFullScreen
                    colorVariant="primary"
                    styleVariant="outline"
                    before={<UploadFillIcon />}
                >
                    {label}
                </RawFileInput>
                <p>
                    {value?.name ?? 'No document selected'}
                </p>
                <Activity mode={isDefined(value) ? 'visible' : 'hidden'}>
                    <IconButton
                        name={undefined}
                        onClick={handleClearButtonClick}
                        title="Clear"
                        ariaLabel="clear"
                        spacing="none"
                    >
                        <DeleteBinLineIcon />
                    </IconButton>
                </Activity>
            </ListView>
            <Activity mode={isDefined(previewUrl) ? 'visible' : 'hidden'}>
                <Image
                    src={previewUrl}
                    alt={value?.name ?? 'Preview'}
                    withContainedFit
                    size="lg"
                />
            </Activity>
            <Activity mode={errorMessage ? 'visible' : 'hidden'}>
                <InputError>
                    {errorMessage}
                </InputError>
            </Activity>
        </>
    );
}

export default FileUpload;
