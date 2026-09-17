import { useCallback } from 'react';
import {
    IoContractOutline,
    IoExpandOutline,
} from 'react-icons/io5';
import { IconButton } from '@ifrc-go/ui';

interface Props {
    expanded: boolean;
    onChange: (expanded: boolean) => void;
}

function FullScreenToggle(props: Props) {
    const {
        expanded,
        onChange,
    } = props;

    const handleClick = useCallback(() => {
        onChange(!expanded);
    }, [expanded, onChange]);

    const label = expanded ? 'Exit full screen' : 'Full screen';

    return (
        <IconButton
            name={undefined}
            onClick={handleClick}
            title={label}
            ariaLabel={label}
            spacing="none"
        >
            {expanded ? <IoContractOutline /> : <IoExpandOutline />}
        </IconButton>
    );
}

export default FullScreenToggle;
