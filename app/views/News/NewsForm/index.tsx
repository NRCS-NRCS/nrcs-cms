import {
    Activity,
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import {
    Navigate,
    useParams,
} from 'react-router';
import {
    BlockLoading,
    Button,
    Checkbox,
    Container,
    DateInput,
    Heading,
    InputSection,
    ListView,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import {
    isNotDefined,
    noOp,
    randomString,
} from '@togglecorp/fujs';
import {
    type ArraySchema,
    createSubmitHandler,
    getErrorObject,
    getErrorString,
    type ObjectSchema,
    type PartialForm,
    removeNull,
    requiredStringCondition,
    urlCondition,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import FileUpload from '#components/FileUpload';
import MarkdownEditor from '#components/MarkdownEditor';
import NonFieldError from '#components/NonFieldError';
import {
    type ActionLinkInput,
    type ActionLinkType,
    type NewsCreateInput,
    type NewsUpdateInput,
    StatusEnum,
    useCreateNewsMutation,
    useDirectiveQuery,
    useNewsDetailQuery,
    useUpdateNewsMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import useUnsavedModal from '#hooks/useUnsavedModal';
import {
    errorMessage,
    idSelector,
    keySelector,
    labelSelector,
    nameSelector,
} from '#utils/common';

import ActionLinkInputComponent from './actionLinkInput';

interface ActionLinkFormValue extends ActionLinkType {
    clientId: string;
}

type PartialFormType = Omit<PartialForm<NewsCreateInput>, 'actionLinks'> &
 { actionLinks?: PartialActionLinkForm[];
};
type PartialActionLinkForm = PartialForm<ActionLinkFormValue, 'clientId'>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type ActionLinkSchema = ObjectSchema<PartialActionLinkForm, PartialFormType>;
type ActionLinkSchemaFields = ReturnType<ActionLinkSchema['fields']>;
type ActionLinksSchema = ArraySchema<PartialActionLinkForm, PartialFormType>;
type ActionLinksSchemaMember = ReturnType<ActionLinksSchema['member']>;

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
        actionLinks: {
            keySelector: (col) => col.clientId,
            member: (): ActionLinksSchemaMember => ({
                fields: (): ActionLinkSchemaFields => ({
                    clientId: { required: true },
                    id: {},
                    label: {
                        required: true,
                        requiredValidation: requiredStringCondition,
                    },
                    url: {
                        required: true,
                        validations: [urlCondition],
                        requiredValidation: requiredStringCondition,
                    },
                }),
            }),

        },
        isHighlighted: {},
    }),
};

const defaultEditFormValue: PartialFormType = {};

function NewsForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const { canEditContent } = usePermissions();
    const alert = useAlert();

    const [{ data: directives }] = useDirectiveQuery();

    const [{ data, fetching: newsDetailFetch }] = useNewsDetailQuery({
        variables: { id: (id ?? '') }, pause: !id,
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
        pristine,
    } = useForm(EditNewsSchema, { value: defaultEditFormValue });

    const {
        unsavedModal,
        bypassUnsavedModal,
    } = useUnsavedModal(!pristine);

    const error = getErrorObject(formError);

    const actionLinkErrors = getErrorObject(error?.actionLinks);

    const {
        setValue: onActionLinkChange,
        removeValue: onActionLinkRemove,
    } = useFormArray<'actionLinks', PartialActionLinkForm>('actionLinks', setFieldValue);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = 'news';
        const alertMessage = `News ${id ? 'updated' : 'created'} successfully`;
        const currentLinks = mutationData.actionLinks ?? [];
        const originalLinks = data?.newsItem?.actionLinks ?? [];
        const { coverImage, file, ...otherMutationData } = mutationData;
        const dataToSubmit = {
            ...otherMutationData,
            coverImage: coverImage instanceof File ? coverImage : undefined,
            file: file instanceof File ? file : undefined,
        };

        if (id) {
            const actionLinksMutation: NonNullable<ActionLinkInput[]> = currentLinks
                .map((link) => {
                    const label = link.label ?? '';
                    const url = link.url ?? '';
                    if (!link.id) {
                        return {
                            create: { label, url },
                        };
                    }
                    return {
                        update: { id: link.id, label, url },
                    };
                });

            originalLinks.forEach((orig) => {
                const exists = currentLinks.find((curr) => curr.id === orig.id);
                if (!exists) {
                    actionLinksMutation.push({
                        delete: { id: orig.id },
                    });
                }
            });

            const res = await updateNewsMutate({
                pk: id,
                data: {
                    ...dataToSubmit,
                    actionLinks: removeNull(actionLinksMutation),
                } as NewsUpdateInput,
            });
            const result = res.data?.updateNews;
            if (result?.ok) {
                bypassUnsavedModal();
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createNewsMutate({
                data: {
                    ...dataToSubmit,
                    actionLinks: currentLinks.map((l) => ({
                        label: l.label ?? '',
                        url: l.url ?? '',
                    })),
                } as NewsCreateInput,
            });
            const result = res.data?.createNews;
            if (result?.ok) {
                bypassUnsavedModal();
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        }
    }, [id, data?.newsItem?.actionLinks, bypassUnsavedModal,
        updateNewsMutate, navigate, alert, setError, createNewsMutate]);

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
            directiveId,
            actionLinks,
            ...other
        } = removeNull(data.newsItem);

        const actionLinksWithClientId = (actionLinks ?? []).map((link) => ({
            ...link,
            clientId: randomString(),
        }));

        setValue({
            ...other,
            directive: directiveId,
            actionLinks: actionLinksWithClientId,
        });
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

    const ContentEditor = (
        <MarkdownEditor
            heading="Write News"
            withAsteriskOnHeading
            headingDescription="Share the story, insights, or updates you'd like readers to know"
            name="content"
            value={value.content}
            onChange={setFieldValue}
            error={error?.content}
            placeholder="Start writing news here..."
        />
    );

    const handleCollectionAdd = useCallback(
        () => {
            const clientId = randomString();
            const newActionLink: PartialActionLinkForm = {
                clientId,
            };

            setFieldValue(
                (oldValue: PartialActionLinkForm[] | undefined) => (
                    [...(oldValue ?? []), newActionLink]
                ),
                'actionLinks',
            );
        },
        [setFieldValue],
    );

    const handleCancelClick = useCallback(() => {
        navigate('news');
    }, [navigate]);

    if (!canEditContent) {
        return <Navigate to="/news" replace />;
    }

    if (newsDetailFetch) {
        return (
            <BlockLoading
                compact
                message="Loading"
            />
        );
    }

    return (
        <Container
            withPadding
            heading={id ? 'NEWS DETAILS' : 'CREATE NEWS'}
            headerDescription={id ? 'Review and update the details of this news article' : 'Fill in the details below to create and publish a news article'}
            footer={(
                <ListView
                    withFullWidth
                    withCenteredContents
                    withBackground
                    withPadding
                >
                    <Button
                        name={undefined}
                        onClick={handleCancelClick}
                    >
                        Cancel
                    </Button>
                    <Button
                        name="save"
                        onClick={handleFormSubmit}
                        styleVariant="filled"
                    >
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </ListView>
            )}
        >
            <ListView layout="block">
                <NonFieldError
                    error={formError}
                    withFallbackError
                />
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
                        error={error?.title}
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
                        error={getErrorString(error?.publishedDate)}
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
                        error={getErrorString(error?.coverImage)}
                        accept="image/*"
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
                        error={getErrorString(error?.file)}
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
                            onChange={noOp}
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
                <InputSection
                    title="Highlight"
                    description="Click on the checkbox if the news is to be Highlighted"
                    withAsteriskOnTitle
                >
                    <Checkbox
                        name="isHighlighted"
                        label="Highlighted"
                        onChange={setFieldValue}
                        value={value.isHighlighted}
                        error={error?.isHighlighted}
                    />
                </InputSection>
                {ContentEditor}
                <InputSection
                    title="Action Link"
                    description="Add link to the highlight and the name to be displayed for the URL"
                >
                    <ListView layout="block" spacing="sm">
                        {(value.actionLinks || []).map((link, index) => (
                            <ActionLinkInputComponent
                                key={link.clientId}
                                index={index}
                                value={link}
                                onChange={onActionLinkChange}
                                onRemove={onActionLinkRemove}
                                error={actionLinkErrors?.[link.clientId ?? 0]}
                            />
                        ))}
                        <Button name="add-link" onClick={handleCollectionAdd}>
                            Add Link
                        </Button>
                    </ListView>
                </InputSection>
            </ListView>
            {unsavedModal}
        </Container>
    );
}

export default NewsForm;
