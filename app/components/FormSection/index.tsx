import React from 'react';
import { Heading } from '@ifrc-go/ui';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

interface FormSectionProps {
    label?: string;
    description?: string;
    children?: React.ReactNode;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
    inputClassName?: string
    withAsteriskOnTitle?: boolean
}
function FormSection({
    label, description, headingLevel = 6, children, className, inputClassName, withAsteriskOnTitle,
}: FormSectionProps) {
    return (
        <div className={_cs(styles.section, className)}>
            {isDefined(label) && (
                <div className={styles.label}>
                    <Heading level={headingLevel}>
                        {label}
                        {withAsteriskOnTitle && (
                            <span aria-hidden className={styles.asterisk}>*</span>
                        )}
                    </Heading>
                    {description && <p>{description}</p>}
                </div>
            )}
            <div className={_cs(styles.input, inputClassName)}>{children}</div>
        </div>
    );
}

export default FormSection;
