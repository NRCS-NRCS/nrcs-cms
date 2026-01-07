import {
    use,
    useCallback,
    useMemo,
} from 'react';
import {
    AlertContext,
    AlertType,
} from '@ifrc-go/ui/contexts';
import { randomString } from '@togglecorp/fujs';

const DEFAULT_ALERT_DISMISS_DURATION = 4500;

interface AddAlertOption {
    name?: string;
    variant?: AlertType;
    duration?: number;
    description?: React.ReactNode;
    nonDismissable?: boolean;
    debugMessage?: string;
}

function useAlert() {
    const {
        addAlert,
        // removeAlert,
        // updateAlert,
    } = use(AlertContext);

    const show = useCallback((title: React.ReactNode, options?: AddAlertOption) => {
        const name = options?.name ?? randomString(16);
        addAlert({
            variant: options?.variant ?? 'info',
            duration: options?.duration ?? DEFAULT_ALERT_DISMISS_DURATION,
            name: options?.name ?? name,
            title,
            description: options?.description,
            nonDismissable: options?.nonDismissable ?? false,
            debugMessage: options?.debugMessage,
        });

        return name;
    }, [addAlert]);

    return useMemo(() => ({
        show,
    }), [show]);
}

export default useAlert;
