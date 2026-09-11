import {
    lazy,
    Suspense,
} from 'react';
import { BlockLoading } from '@ifrc-go/ui';

import type MarkdownEditorImpl from './editor';
import { type Props } from './editor';

const Editor = lazy(() => import('./editor')) as unknown as typeof MarkdownEditorImpl;

function MarkdownEditor<const NAME>(props: Props<NAME>) {
    return (
        <Suspense
            fallback={(
                <BlockLoading
                    compact
                    message="Loading editor"
                />
            )}
        >
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <Editor {...props} />
        </Suspense>
    );
}

export default MarkdownEditor;
