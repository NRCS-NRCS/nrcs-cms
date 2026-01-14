import {
    useCallback,
    useEffect,
} from 'react';
import {
    useNavigate,
    useParams,
} from 'react-router';
import {
    Button,
    Container,
    DateInput,
    Heading,
    RawFileInput,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import {
    createSubmitHandler,
    getErrorObject,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import FormSection from '#components/FormSection';
import Page from '#components/Page';
import RichTextEditor from '#components/RichTextEditor';
import {
    NewsCreateInput,
    StatusEnum,
    useCreateNewsMutation,
    useDirectiveQuery,
    useNewsDetailQuery,
    useUpdateNewsMutation,
} from '#generated/types/graphql';
import urlToFile from '#utils/urlToFile';

import styles from './styles.module.css';

type PartialFormType = PartialForm<NewsCreateInput> &
{ createdBy: string, modifiedBy: string }

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const EditBlogSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        file: {
            required: false,
        },
        publishedDate: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        coverImage: {
            required: true,
        },
        content: {
            required: true,
            requiredValidation: requiredStringCondition,

        },
        directive: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        status: {
            required: true,
        },
        slug: {},
        createdBy: {},
        modifiedBy: {},

    }),
};

const defaultEditFormValue: PartialFormType = {
    createdBy: '',
    modifiedBy: '',
};
function NewsForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [{ data: directives }] = useDirectiveQuery();

    const [{ data }] = useNewsDetailQuery({
        variables: { id: id || '' }, pause: !id,
    });
    const [{ fetching: createPending }, createNewsMutate] = useCreateNewsMutation();
    const [{ fetching: updatePending }, updateNewsMutate] = useUpdateNewsMutation();
    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
    } = useForm(EditBlogSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const handleFormSubmit = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            async (val) => {
                const mutateData = {
                    content: val.content ?? '',
                    coverImage: val.coverImage ?? null,
                    title: val.title ?? '',
                    file: val.file ?? null,
                    status: val.status ?? '' as StatusEnum,
                    publishedDate: val.publishedDate ?? '',
                    directive: val.directive ?? '',

                };
                if (id) {
                    const res = await updateNewsMutate({
                        pk: id,
                        data: mutateData,
                    });
                    if (res.data?.updateNews?.ok) {
                        navigate('/news');
                    } else if (res.data?.updateNews.errors) {
                        setError(res.data.updateNews.errors);
                    }
                } else {
                    const res = await createNewsMutate({
                        data: mutateData,
                    });

                    if (res.data?.createNews.ok) {
                        navigate('/news');
                    } else if (res.data?.createNews?.errors) {
                        setError(res.data.createNews.errors);
                    }
                }
            },
        );
        handler();
    }, [setError, validate, id, createNewsMutate, updateNewsMutate, navigate]);

    useEffect(() => {
        if (data?.newsItem) {
            const { newsItem } = data;
            setFieldValue(newsItem.title, 'title');
            setFieldValue(newsItem.content, 'content');
            if (newsItem.file) {
                urlToFile(newsItem.file.url, newsItem.file.name)
                    .then((file) => {
                        setFieldValue(file, 'file');
                    });
            }
            if (newsItem.coverImage) {
                urlToFile(newsItem.coverImage.url, newsItem.coverImage.name)
                    .then((file) => {
                        setFieldValue(file, 'coverImage');
                    });
            }
            setFieldValue(newsItem.directiveId ?? '', 'directive');
            setFieldValue(newsItem.publishedDate, 'publishedDate');
            setFieldValue(newsItem.slug, 'slug');
            setFieldValue(newsItem.status, 'status');
            setFieldValue(`${newsItem.modifiedBy.firstName} ${newsItem.modifiedBy.lastName}`, 'modifiedBy');
            setFieldValue(`${newsItem.createdBy.firstName} ${newsItem.createdBy.lastName}`, 'createdBy');
        }
    }, [data, setFieldValue]);

    const directiveOptions = directives?.strategicDirectives.results.map(
        (directive) => ({
            id: directive.id,
            name: directive.title,
        }),
    ) ?? [];

    const statusOptions = Object.values(StatusEnum).map((status) => ({
        value: status,
        label: status,
    }));
    return (
        <Page>
            <Container
                className={styles.container}
                childrenContainerClassName={styles.containerChild}
            >
                <FormSection headingLevel={3} label="News Detail" />
                {(value.createdBy && value.modifiedBy) && (
                    <FormSection inputClassName={styles.inputClassName}>
                        <div>
                            <Heading level={6}>Created by:</Heading>
                            <Heading level={6}>{value.createdBy}</Heading>
                        </div>
                        <div>
                            <Heading level={6}>Modified by:</Heading>
                            <Heading level={6}>{value.createdBy}</Heading>
                        </div>
                    </FormSection>
                )}
                <FormSection label="Title*" description="Enter the title name of the Blog">
                    <TextInput
                        name="title"
                        value={value.title}
                        error={error?.title as string}
                        onChange={setFieldValue}
                    />
                </FormSection>
                <FormSection label="Published Date*" description="This date should be the Published Date of the blog">
                    <DateInput
                        name="publishedDate"
                        value={value.publishedDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={error?.publishedDate as string}
                    />
                </FormSection>
                <FormSection label="Strategic Directive (NS)" description="Select under which strategic directive it belongs">
                    <SelectInput
                        name="directive"
                        options={directiveOptions}
                        value={value.directive}
                        keySelector={(option) => option.id}
                        labelSelector={(option) => option.name}
                        onChange={setFieldValue}
                        placeholder="Select Directive"
                        error={error?.directive}
                    />
                </FormSection>
                <FormSection label="Cover photo*" description="Add a cover photo, which will be displayed on top">
                    <RawFileInput
                        name="coverImage"
                        onChange={(files) => setFieldValue(files, 'coverImage')}
                        variant="secondary"
                    >
                        Upload
                    </RawFileInput>
                    {value.coverImage?.name && <p>{value.coverImage.name}</p>}
                </FormSection>
                <FormSection label="File*" description="Add a cover photo, which will be displayed on top">
                    <RawFileInput
                        name="file"
                        onChange={(files) => setFieldValue(files, 'file')}
                        variant="secondary"
                    >
                        Upload
                    </RawFileInput>
                    {value.file?.name && <p>{value.file.name}</p>}
                </FormSection>
                {value.slug && (
                    <FormSection label="Slug*" description="Unique URL identifier for the blog">
                        <TextInput
                            name="slug"
                            value={value.slug ?? ''}
                            onChange={(val) => setFieldValue(val || null, 'slug')}
                            error={error?.slug}
                            disabled
                        />
                    </FormSection>
                )}
                <FormSection label="Status*" description="Add status to either draft, publish or archived">
                    <SelectInput
                        name="status"
                        options={statusOptions}
                        value={value.status}
                        keySelector={(o) => o.label}
                        labelSelector={(o) => o.value}
                        onChange={setFieldValue}
                        placeholder="Select Status"
                        error={error?.status}
                    />
                </FormSection>
                <FormSection label="Write blog" />
                <div>
                    <RichTextEditor
                        value={value.content}
                        onChange={(val) => setFieldValue(val, 'content')}
                    />
                </div>
                <div className={styles.submitBtn}>
                    <Button name="save" onClick={handleFormSubmit} variant="primary">
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </div>
            </Container>
        </Page>
    );
}

export default NewsForm;
