import {
    useCallback,
    useState,
} from 'react';
import {
    Button,
    type ConfirmButtonProps,
    ListView,
    Modal,
} from '@ifrc-go/ui';

function ConfirmButton<const NAME>(props: ConfirmButtonProps<NAME>) {
    const {
        confirmHeading = 'Confirmation',
        confirmMessage = 'Are you sure you want to continue?',
        name,
        onConfirm,
        onClick,
        ...otherProps
    } = props;

    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleClick = useCallback(
        (buttonName: NAME, event: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(buttonName, event);
            setShowConfirmation(true);
        },
        [onClick],
    );

    const handleClose = useCallback(() => {
        setShowConfirmation(false);
    }, []);

    const handleConfirm = useCallback(() => {
        setShowConfirmation(false);
        onConfirm(name);
    }, [onConfirm, name]);

    return (
        <>
            <Button
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                name={name}
                onClick={handleClick}
            />
            {showConfirmation && (
                <Modal
                    heading={confirmHeading}
                    size="sm"
                    onClose={handleClose}
                    footerActions={(
                        <ListView spacing="sm">
                            <Button
                                name={undefined}
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                name={undefined}
                                styleVariant="filled"
                                onClick={handleConfirm}
                            >
                                Ok
                            </Button>
                        </ListView>
                    )}
                >
                    {confirmMessage}
                </Modal>
            )}
        </>
    );
}

export default ConfirmButton;
