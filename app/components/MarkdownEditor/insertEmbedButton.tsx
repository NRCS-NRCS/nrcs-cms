import {
    useCallback,
    useState,
} from 'react';
import { IoVideocamOutline } from 'react-icons/io5';
import { IconButton } from '@ifrc-go/ui';

import { buildEmbedBlock } from '#utils/embed';

import EmbedDialog, { type EmbedValue } from './embedDialog';

interface Props {
    onInsert: (markdown: string) => void;
}

function InsertEmbedButton(props: Props) {
    const { onInsert } = props;

    const [showModal, setShowModal] = useState(false);

    const handleOpen = useCallback(() => {
        setShowModal(true);
    }, []);

    const handleClose = useCallback(() => {
        setShowModal(false);
    }, []);

    const handleSubmit = useCallback((value: EmbedValue) => {
        onInsert(buildEmbedBlock(value));
        setShowModal(false);
    }, [onInsert]);

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
                <EmbedDialog
                    heading="Insert Video"
                    submitLabel="Insert"
                    onSubmit={handleSubmit}
                    onClose={handleClose}
                />
            )}
        </>
    );
}

export default InsertEmbedButton;
