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
    Container,
    DateInput,
    Heading,
    InputSection,
    ListView,
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

import FileUpload from '#components/FileUpload';
import MarkdownEditor from '#components/MarkdownEditor';
import {
    NewsCreateInput,
    NewsUpdateInput,
    StatusEnum,
    useCreateNewsMutation,
    useDirectiveQuery,
    useNewsDetailQuery,
    useUpdateNewsMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import {
    errorMessage,
    idSelector,
    keySelector,
    labelSelector,
    nameSelector,
} from '#utils/common';
import urlToFile from '#utils/urlToFile';

type PartialFormType = PartialForm<NewsCreateInput>

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
    }),
};

const defaultEditFormValue: PartialFormType = {};

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

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = '/news';
        const alertMessage = `News ${id ? 'updated' : 'created'} successfully`;
        if (id) {
            const res = await updateNewsMutate({
                pk: id,
                data: mutationData as NewsUpdateInput,
            });
            const result = res.data?.updateNews;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createNewsMutate({
                data: mutationData as NewsCreateInput,
            });
            const result = res.data?.createNews;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        }
    }, [alert, updateNewsMutate, id, navigate, setError, createNewsMutate]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            handleMutation,
        )(),
        [validate, setError, handleMutation],
    );

    useEffect(() => {
        if (isNotDefined(data?.newsItem)) {
            return;
        }
        const {
            coverImage,
            file,
            directiveId,
            ...other
        } = removeNull(data.newsItem);

        setValue({
            ...other,
            directive: directiveId,
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
        key: status,
        label: status,
    })), []);

    const ContentEditor = useMemo(() => (
        <MarkdownEditor
            value={value.content}
            onChange={(val) => setFieldValue(val, 'content')}
            error={error?.content}
        />
    ), [value.content, error?.content, setFieldValue]);

    return (
        <Container withPadding>
            <ListView layout="block">
                <InputSection withoutTitleSection>
                    <Heading>
                        {id ? 'NEWS DETAILS' : 'CREATE NEWS'}
                    </Heading>
                </InputSection>
                <Activity mode={data?.newsItem.createdBy && data.newsItem.modifiedBy ? 'visible' : 'hidden'}>
                    <InputSection
                        title={`Created by: ${data?.newsItem.createdBy.firstName} ${data?.newsItem.createdBy.lastName}`}
                    >
                        <Heading level={6}>
                            Modified by:
                            {' '}
                            {data?.newsItem.modifiedBy.firstName}
                            {' '}
                            {data?.newsItem.modifiedBy.lastName}
                        </Heading>
                    </InputSection>
                </Activity>
                <InputSection
                    title="Title"
                    description="Enter the title name of the News"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="title"
                        value={value.title}
                        error={error?.title as string}
                        onChange={setFieldValue}
                        autoFocus
                        placeholder="title"
                    />
                </InputSection>
                <InputSection
                    title="Published Date"
                    description="This date should be the Published Date of the news"
                    withAsteriskOnTitle
                >
                    <DateInput
                        name="publishedDate"
                        value={value.publishedDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={error?.publishedDate as string}
                    />
                </InputSection>
                <InputSection
                    title="Strategic Directive (NS)"
                    description="Select under which strategic directive it belongs"
                >
                    <SelectInput
                        name="directive"
                        options={directiveOptions}
                        value={value.directive}
                        keySelector={idSelector}
                        labelSelector={nameSelector}
                        onChange={setFieldValue}
                        placeholder="Select Directive"
                        error={error?.directive}
                    />
                </InputSection>
                <InputSection
                    title="Cover photo"
                    description="Add a cover photo, which will be displayed on top"
                    withAsteriskOnTitle
                >
                    <FileUpload
                        name="coverImage"
                        onChange={setFieldValue}
                        value={value.coverImage}
                        error={error?.coverImage as string}
                    />
                </InputSection>
                <InputSection
                    title="File"
                    description="Add a file, which will be displayed on the page"
                    withAsteriskOnTitle
                >
                    <FileUpload
                        name="file"
                        onChange={setFieldValue}
                        value={value.file}
                        error={error?.file as string}
                    />
                </InputSection>
                <Activity mode={value.slug ? 'visible' : 'hidden'}>
                    <InputSection
                        title="Slug"
                        description="Unique URL identifier for the news"
                    >
                        <TextInput
                            name="slug"
                            value={value.slug ?? ''}
                            onChange={() => {}}
                            error={error?.slug}
                            readOnly
                        />
                    </InputSection>
                </Activity>
                <InputSection
                    title="Status"
                    description="Add status to either draft, publish or archived"
                    withAsteriskOnTitle
                >
                    <SelectInput
                        name="status"
                        options={statusOptions}
                        value={value.status}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        onChange={setFieldValue}
                        placeholder="Select Status"
                        error={error?.status}
                    />
                </InputSection>
                <InputSection withoutTitleSection>
                    <Heading level={5}>
                        Write News
                    </Heading>
                </InputSection>
                <InputSection withoutTitleSection>{ContentEditor}</InputSection>
                <ListView withPadding withBackground withCenteredContents>
                    <Button name="save" onClick={handleFormSubmit} styleVariant="outline">
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </ListView>
            </ListView>
        </Container>
    );
}

export default NewsForm;
