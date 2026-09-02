import { IoVideocamOutline } from 'react-icons/io5';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    IconButton,
    ListView,
} from '@ifrc-go/ui';
import {
    type CodeBlockEditorProps,
    useCodeBlockEditorContext,
} from '@mdxeditor/editor';

import { parseEmbedBody } from '#utils/embed';

import styles from './styles.module.css';

function EmbedBlockEditor(props: CodeBlockEditorProps) {
    const { code } = props;

    const { parentEditor, lexicalNode } = useCodeBlockEditorContext();
    const embed = parseEmbedBody(code);

    const handleRemove = () => {
        parentEditor.update(() => {
            lexicalNode.remove();
        });
    };

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
        </div>
    );
}

export default EmbedBlockEditor;
