import {
    Activity,
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import {
    useNavigate,
    useParams,
} from 'react-router';
import {
    Button,
    DateInput,
    Heading,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import { isNotDefined } from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    ObjectSchema,
    PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import ContainerWrapper from '#components/ContainerWrapper';
import FileUpload from '#components/FileUpload';
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
import useAlert from '#hooks/useAlert';
import urlToFile from '#utils/urlToFile';

type PartialFormType = PartialForm<NewsCreateInput> &
{ createdBy: string, modifiedBy: string }

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const EditNewsSchema: FormSchema = {
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
    const alert = useAlert();

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
        setValue,
    } = useForm(EditNewsSchema, { value: defaultEditFormValue });

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
                        alert.show('News updated successfully', { variant: 'success' });
                    } else if (res.data?.updateNews.errors) {
                        const errorMessages = res.data?.updateNews?.errors;
                        alert.show(errorMessages, { variant: 'danger' });
                        setError(res.data.updateNews.errors);
                    }
                } else {
                    const res = await createNewsMutate({
                        data: mutateData,
                    });

                    if (res.data?.createNews.ok) {
                        navigate('/news');
                        alert.show('News created successfully', { variant: 'success' });
                    } else if (res.data?.createNews?.errors) {
                        const errorMessages = res.data?.createNews?.errors;
                        setError(res.data.createNews.errors);
                        alert.show(errorMessages, { variant: 'danger' });
                    }
                }
            },
        );
        handler();
    }, [setError, alert, validate, id, createNewsMutate, updateNewsMutate, navigate]);

    useEffect(() => {
        if (isNotDefined(data?.newsItem)) {
            return;
        }
        const {
            modifiedBy,
            createdBy,
            coverImage,
            file,
            directiveId,
            ...other
        } = removeNull(data.newsItem);

        setValue({
            ...other,
            directive: directiveId,
            modifiedBy: `${modifiedBy.firstName} ${modifiedBy.lastName}`,
            createdBy: `${createdBy.firstName} ${createdBy.lastName}`,
        });

        if (coverImage) {
            urlToFile(coverImage.url, coverImage.name).then((coverImageData) => {
                setValue((prev) => ({
                    ...prev,
                    coverImage: coverImageData,
                }));
            });
        }
        if (file) {
            urlToFile(file.url, file.name).then((fileData) => {
                setValue((prev) => ({
                    ...prev,
                    file: fileData,
                }));
            });
        }
    }, [data, setValue]);

    const directiveOptions = useMemo(() => directives?.strategicDirectives.results.map(
        (directive) => ({
            id: directive.id,
            name: directive.title,
        }),
    ) ?? [], [directives]);

    const statusOptions = useMemo(() => Object.values(StatusEnum).map((status) => ({
        value: status,
        label: status,
    })), []);

    const ContentEditor = useMemo(() => (
        <RichTextEditor
            value={value.content}
            onChange={(val) => setFieldValue(val, 'content')}
            error={error?.content}
        />
    ), [value.content, error?.content, setFieldValue]);

    return (
        <Page>
            <ContainerWrapper>
                <FormSection headingLevel={3} label={id ? 'NEWS DETAILS' : 'CREATE NEWS'} />
                <Activity mode={value.createdBy && value.modifiedBy ? 'visible' : 'hidden'}>
                    <FormSection>
                        <Heading level={6}>
                            Created by:
                            {' '}
                            {value.createdBy}
                        </Heading>
                        <Heading level={6}>
                            Modified by:
                            {' '}
                            {value.createdBy}
                        </Heading>
                    </FormSection>
                </Activity>
                <FormSection label="Title" description="Enter the title name of the News" withAsteriskOnTitle>
                    <TextInput
                        name="title"
                        value={value.title}
                        error={error?.title as string}
                        onChange={setFieldValue}
                        autoFocus
                        placeholder="title"
                    />
                </FormSection>
                <FormSection label="Published Date" description="This date should be the Published Date of the news" withAsteriskOnTitle>
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
                <FormSection label="Cover photo" description="Add a cover photo, which will be displayed on top" withAsteriskOnTitle>
                    <FileUpload
                        name="coverImage"
                        onChange={(files) => setFieldValue(files, 'coverImage')}
                        value={value.coverImage}
                        error={error?.coverImage as string}
                    />
                </FormSection>
                <FormSection label="File" description="Add a file, which will be displayed on the page" withAsteriskOnTitle>
                    <FileUpload
                        name="file"
                        onChange={(files) => setFieldValue(files, 'file')}
                        value={value.file}
                        error={error?.file as string}
                    />
                </FormSection>
                <Activity mode={value.slug ? 'visible' : 'hidden'}>
                    <FormSection label="Slug" description="Unique URL identifier for the news">
                        <TextInput
                            name="slug"
                            value={value.slug ?? ''}
                            onChange={(val) => setFieldValue(val || null, 'slug')}
                            error={error?.slug}
                            readOnly
                        />
                    </FormSection>
                </Activity>
                <FormSection label="Status" description="Add status to either draft, publish or archived" withAsteriskOnTitle>
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
                <FormSection>{ContentEditor}</FormSection>
                <FormSection>
                    <Button name="save" onClick={handleFormSubmit} variant="primary">
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </FormSection>
            </ContainerWrapper>
        </Page>
    );
}

export default NewsForm;
