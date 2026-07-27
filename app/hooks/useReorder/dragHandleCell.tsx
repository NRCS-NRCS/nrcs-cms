import { DragDropLineIcon } from '@ifrc-go/icons';

import styles from './styles.module.css';

const DRAG_TITLE = 'Drag to reorder';

function DragHandleCell() {
    return (
        <div className={styles.dragHandle}>
            <DragDropLineIcon title={DRAG_TITLE} />
        </div>
    );
}

export default DragHandleCell;
