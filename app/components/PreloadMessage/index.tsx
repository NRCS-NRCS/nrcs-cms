import styles from './styles.module.css';

interface Props {
    children?: React.ReactNode;
}

function PreloadMessage(props: Props) {
    const { children } = props;

    return (
        <div className={styles.preloadMessage}>
            {children}
        </div>
    );
}

export default PreloadMessage;
