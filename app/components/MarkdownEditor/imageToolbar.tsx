import { useCallback } from 'react';
import {
    DeleteBinLineIcon,
    PencilLineIcon,
} from '@ifrc-go/icons';
import {
    IconButton,
    ListView,
} from '@ifrc-go/ui';
import {
    activeEditor$,
    lexical,
    openEditImageDialog$,
    parseImageDimension,
    rootEditor$,
    useCellValues,
    usePublisher,
} from '@mdxeditor/editor';
import { isNotDefined } from '@togglecorp/fujs';

import styles from './styles.module.css';

const { $getNodeByKey } = lexical;

interface Props {
    nodeKey?: string;
    imageSource?: string;
    initialImagePath?: string | null;
    title?: string;
    alt?: string;
    width?: number | 'inherit';
    height?: number | 'inherit';
}

function ImageToolbar(props: Props) {
    const {
        nodeKey,
        imageSource = '',
        initialImagePath,
        title = '',
        alt = '',
        width,
        height,
    } = props;

    const [activeEditor, rootEditor] = useCellValues(activeEditor$, rootEditor$);
    const openEditImageDialog = usePublisher(openEditImageDialog$);

    const handleRemove = useCallback(() => {
        if (isNotDefined(nodeKey)) {
            return;
        }
        const editors = activeEditor === rootEditor
            ? [activeEditor]
            : [activeEditor, rootEditor];

        editors.forEach((editor) => {
            editor?.update(() => {
                $getNodeByKey(nodeKey)?.remove();
            });
        });
    }, [activeEditor, rootEditor, nodeKey]);

    const handleEdit = useCallback(() => {
        if (isNotDefined(nodeKey)) {
            return;
        }
        openEditImageDialog({
            nodeKey,
            initialValues: {
                src: initialImagePath ?? imageSource,
                title,
                altText: alt,
                width: parseImageDimension(width),
                height: parseImageDimension(height),
            },
        });
    }, [
        nodeKey,
        initialImagePath,
        imageSource,
        title,
        alt,
        width,
        height,
        openEditImageDialog,
    ]);

    return (
        <div contentEditable={false}>
            <ListView
                className={styles.imageToolbar}
                spacing="xs"
            >
                <IconButton
                    name={undefined}
                    onClick={handleEdit}
                    title="Edit image"
                    ariaLabel="Edit image"
                    spacing="none"
                >
                    <PencilLineIcon />
                </IconButton>
                <IconButton
                    name={undefined}
                    onClick={handleRemove}
                    title="Remove image"
                    ariaLabel="Remove image"
                    spacing="none"
                >
                    <DeleteBinLineIcon />
                </IconButton>
            </ListView>
            {title && (
                <div className={styles.imageCaption}>
                    {title}
                </div>
            )}
        </div>
    );
}

export default ImageToolbar;
