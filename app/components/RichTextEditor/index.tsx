import { Heading } from '@ifrc-go/ui';
import { Editor } from '@tinymce/tinymce-react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

import styles from './styles.module.css';

interface Props {
    value?: string;
    onChange?: (value: string) => void;
}

const API_KEY = import.meta.env.APP_TINYMCE_API_KEY;

export default function RichTextEditor({ value, onChange }: Props) {
    const editorOptions = {
        height: 600,
        menubar: false,
        statusbar: false,
        paste_data_images: false,
        plugins: 'advlist autolink code help link lists fullscreen',
        toolbar:
            'bold italic subscript superscript link | blocks '
            + 'alignleft aligncenter alignright alignjustify | '
            + 'bullist numlist outdent indent | fullscreen | help',
        contextmenu: 'link',
        block_formats:
            'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4;',
        branding: false,
        advlist_bullet_styles: 'default',
        advlist_number_styles: 'default',
        content_style: 'body { font-size: 14px}',
    };

    return (
        <div className={styles.editorContainer}>
            <Editor
                apiKey={API_KEY}
                value={value}
                onEditorChange={(content) => {
                    onChange?.(content);
                }}
                init={editorOptions}

            />
            <div className={styles.preview}>
                <Heading level={2} className={styles.previewHeader}>Preview</Heading>
                <div className={styles.previewContent}>
                    {parse(DOMPurify.sanitize(value ?? ''))}
                </div>
            </div>
        </div>
    );
}
