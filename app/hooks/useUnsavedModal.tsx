import {
    useCallback,
    useEffect,
    useRef,
} from 'react';
import { useBlocker } from 'react-router';
import {
    Button,
    ListView,
    Modal,
} from '@ifrc-go/ui';

/**
 * Prompts the user for confirmation before leaving the page
 * (in-app navigation, tab close or reload) while there are unsaved changes.
 *
 * In-app navigation shows the returned `unsavedModal`; render it inside the
 * form's JSX. Tab close and reload use the browser's native dialog (browsers
 * do not allow custom UI there).
 *
 * Call `bypassUnsavedModal` right before an intentional navigation
 * (e.g. redirect after a successful submit) to skip the prompt.
 */
function useUnsavedModal(hasUnsavedChanges: boolean) {
    const bypassRef = useRef(false);

    const blocker = useBlocker(
        useCallback(
            () => !bypassRef.current && hasUnsavedChanges,
            [hasUnsavedChanges],
        ),
    );

    useEffect(
        () => {
            if (!hasUnsavedChanges) {
                return undefined;
            }
            const handleBeforeUnload = (event: BeforeUnloadEvent) => {
                if (bypassRef.current) {
                    return;
                }
                event.preventDefault();
            };
            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        },
        [hasUnsavedChanges],
    );

    const handleStay = useCallback(
        () => {
            if (blocker.state === 'blocked') {
                blocker.reset();
            }
        },
        [blocker],
    );

    const handleLeave = useCallback(
        () => {
            if (blocker.state === 'blocked') {
                blocker.proceed();
            }
        },
        [blocker],
    );

    const unsavedModal = blocker.state === 'blocked' ? (
        <Modal
            heading="Unsaved Changes"
            size="sm"
            onClose={handleStay}
            footerActions={(
                <ListView spacing="xs">
                    <Button
                        name="stay"
                        onClick={handleStay}
                        styleVariant="outline"
                    >
                        Stay
                    </Button>
                    <Button
                        name="leave"
                        onClick={handleLeave}
                        styleVariant="filled"
                    >
                        Leave
                    </Button>
                </ListView>
            )}
        >
            You have unsaved changes. Are you sure you want to leave this page?
        </Modal>
    ) : null;

    const bypassUnsavedModal = useCallback(
        () => {
            bypassRef.current = true;
        },
        [],
    );

    return {
        unsavedModal,
        bypassUnsavedModal,
    };
}

export default useUnsavedModal;
