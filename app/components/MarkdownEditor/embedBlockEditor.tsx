import {
    useCallback,
    useState,
} from 'react';
import { IoVideocamOutline } from 'react-icons/io5';
import {
    DeleteBinLineIcon,
    PencilLineIcon,
} from '@ifrc-go/icons';
import {
    IconButton,
    ListView,
} from '@ifrc-go/ui';
import {
    type CodeBlockEditorProps,
    useCodeBlockEditorContext,
} from '@mdxeditor/editor';

import {
    buildEmbedBody,
    parseEmbedBody,
} from '#utils/embed';

import EmbedDialog, { type EmbedValue } from './embedDialog';

import styles from './styles.module.css';

function EmbedBlockEditor(props: CodeBlockEditorProps) {
    const { code } = props;

    const { parentEditor, lexicalNode, setCode } = useCodeBlockEditorContext();
    const embed = parseEmbedBody(code);

    const [showEditModal, setShowEditModal] = useState(false);

    const handleRemove = useCallback(() => {
        parentEditor.update(() => {
            lexicalNode.remove();
        });
    }, [parentEditor, lexicalNode]);

    const handleEditOpen = useCallback(() => {
        setShowEditModal(true);
    }, []);

    const handleEditClose = useCallback(() => {
        setShowEditModal(false);
    }, []);

    const handleEditSubmit = useCallback((value: EmbedValue) => {
        setCode(buildEmbedBody(value));
        setShowEditModal(false);
    }, [setCode]);

    return (
        <div
            className={styles.embedBlock}
            contentEditable={false}
        >
            <ListView className={styles.embedBlockHeader} spacing="xs">
                <IoVideocamOutline />
                <div className={styles.embedBlockTitle}>
                    {embed.caption || 'Video'}
                </div>
                {embed.orientation && (
                    <div className={styles.embedBlockMeta}>
                        {embed.orientation}
                    </div>
                )}
                <IconButton
                    name={undefined}
                    onClick={handleEditOpen}
                    title="Edit video"
                    ariaLabel="Edit video"
                    spacing="none"
                >
                    <PencilLineIcon />
                </IconButton>
                <IconButton
                    name={undefined}
                    onClick={handleRemove}
                    title="Remove video"
                    ariaLabel="Remove video"
                    spacing="none"
                >
                    <DeleteBinLineIcon />
                </IconButton>
            </ListView>
            <div className={styles.embedBlockUrl}>
                {embed.url ?? 'No video URL set'}
            </div>
            {showEditModal && (
                <EmbedDialog
                    heading="Edit Video"
                    submitLabel="Save"
                    initialValue={embed}
                    onSubmit={handleEditSubmit}
                    onClose={handleEditClose}
                />
            )}
        </div>
    );
}

export default EmbedBlockEditor;
