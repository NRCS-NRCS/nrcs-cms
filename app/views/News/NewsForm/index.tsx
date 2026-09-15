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
import { UploadFillIcon } from '@ifrc-go/icons';
import {
    BlockLoading,
    Button,
    Container,
    DateInput,
    Heading,
    InputSection,
    ListView,
    RawFileInput,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import {
    isDefined,
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
    type CreateNewsMutation,
    type KeyStatInput,
    type NewsAttachmentInput,
    type NewsCreateInput,
    type NewsUpdateInput,
    type UpdateNewsMutation,
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
    ACCEPTED_FILE_TYPES,
    ACCEPTED_IMAGE_TYPES,
    BYTES_PER_MEGA_BYTE,
    errorMessage,
    idSelector,
    labelSelector,
    MAX_FEATURED_KEY_STATS,
    MAX_NEWS_ATTACHMENT_SIZE_IN_MB,
    MAX_NEWS_ATTACHMENTS,
    nameSelector,
    statusOptions,
    valueSelector,
} from '#utils/common';

import ActionLinkInputComponent from './actionLinkInput';
import AttachmentInputComponent, { type PartialAttachmentForm } from './attachmentInput';
import KeyStatInputComponent, { type PartialKeyStatForm } from './keyStatInput';

interface ActionLinkFormValue extends ActionLinkType {
    clientId: string;
}

type PartialFormType = Omit<PartialForm<NewsCreateInput>, 'actionLinks' | 'keyStats' | 'attachments'> &
 { actionLinks?: PartialActionLinkForm[];
     keyStats?: PartialKeyStatForm[];
     attachments?: PartialAttachmentForm[];
};
type PartialActionLinkForm = PartialForm<ActionLinkFormValue, 'clientId'>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type ActionLinkSchema = ObjectSchema<PartialActionLinkForm, PartialFormType>;
type ActionLinkSchemaFields = ReturnType<ActionLinkSchema['fields']>;
type ActionLinksSchema = ArraySchema<PartialActionLinkForm, PartialFormType>;
type ActionLinksSchemaMember = ReturnType<ActionLinksSchema['member']>;

type KeyStatSchema = ObjectSchema<PartialKeyStatForm, PartialFormType>;
type KeyStatSchemaFields = ReturnType<KeyStatSchema['fields']>;
type KeyStatsSchema = ArraySchema<PartialKeyStatForm, PartialFormType>;
type KeyStatsSchemaMember = ReturnType<KeyStatsSchema['member']>;

type AttachmentSchema = ObjectSchema<PartialAttachmentForm, PartialFormType>;
type AttachmentSchemaFields = ReturnType<AttachmentSchema['fields']>;
type AttachmentsSchema = ArraySchema<PartialAttachmentForm, PartialFormType>;
type AttachmentsSchemaMember = ReturnType<AttachmentsSchema['member']>;

const EditNewsSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: {
            required: true,
            requiredValidation: requiredStringCondition,
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
            required: false,
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
        keyStats: {
            keySelector: (col) => col.clientId,
            validation: (stats) => {
                const featured = (stats ?? []).filter((stat) => stat.featured).length;
                if (featured > MAX_FEATURED_KEY_STATS) {
                    return `At most ${MAX_FEATURED_KEY_STATS} key stats can be featured.`;
                }
                return undefined;
            },
            member: (): KeyStatsSchemaMember => ({
                fields: (): KeyStatSchemaFields => ({
                    clientId: { required: true },
                    id: {},
                    order: {},
                    featured: {},
                    title: {
                        required: true,
                        requiredValidation: requiredStringCondition,
                    },
                    stat: {
                        required: true,
                    },
                }),
            }),
        },
        attachments: {
            keySelector: (col) => col.clientId,
            validation: (attachments) => {
                if ((attachments ?? []).length > MAX_NEWS_ATTACHMENTS) {
                    return `At most ${MAX_NEWS_ATTACHMENTS} attachments can be added.`;
                }
                return undefined;
            },
            member: (): AttachmentsSchemaMember => ({
                fields: (): AttachmentSchemaFields => ({
                    clientId: { required: true },
                    id: {},
                    order: {},
                    label: {},
                    file: {
                        required: true,
                    },
                }),
            }),
        },
    }),
};

const defaultEditFormValue: PartialFormType = {};

type MutationResponse =
    | CreateNewsMutation['createNews']
    | UpdateNewsMutation['updateNews']
    | undefined;

function getDataToSubmit(formValue: PartialFormType) {
    const { coverImage, ...other } = formValue;
    return {
        ...other,
        coverImage: coverImage instanceof File ? coverImage : undefined,
    };
}

type NestedMutationInput<CREATE, UPDATE> = {
    create: CREATE;
} | {
    update: UPDATE & { id: string };
} | {
    delete: { id: string };
};

function getItemsToCreate<ITEM, CREATE>(
    items: ITEM[],
    getCreatePayload: (item: ITEM, index: number) => CREATE | undefined,
): CREATE[] {
    return items
        .map((item, index) => getCreatePayload(item, index))
        .filter(isDefined);
}

function getItemsToMutate<
    ITEM extends { id?: string | null },
    CREATE extends object,
    UPDATE extends object,
>(
    currentItems: ITEM[],
    savedItems: { id: string }[],
    getCreatePayload: (item: ITEM, index: number) => CREATE | undefined,
    getUpdatePayload: (item: ITEM, index: number) => UPDATE | undefined,
): NestedMutationInput<CREATE, UPDATE>[] {
    const mutations: NestedMutationInput<CREATE, UPDATE>[] = [];
    const currentIds = new Set<string>();

    currentItems.forEach((item, index) => {
        const { id } = item;

        if (isNotDefined(id)) {
            const createPayload = getCreatePayload(item, index);
            if (isDefined(createPayload)) {
                mutations.push({ create: createPayload });
            }
            return;
        }

        currentIds.add(id);

        const updatePayload = getUpdatePayload(item, index);
        if (isDefined(updatePayload)) {
            mutations.push({ update: { ...updatePayload, id } });
        }
    });

    const deletions = savedItems
        .filter((savedItem) => !currentIds.has(savedItem.id))
        .map<NestedMutationInput<CREATE, UPDATE>>(
            (savedItem) => ({ delete: { id: savedItem.id } }),
        );

    return [...mutations, ...deletions];
}

function getActionLinkPayload(link: PartialActionLinkForm) {
    return {
        label: link.label ?? '',
        url: link.url ?? '',
    };
}

function getKeyStatPayload(stat: PartialKeyStatForm, index: number) {
    return {
        order: index + 1,
        title: stat.title ?? '',
        stat: stat.stat ?? 0,
        featured: stat.featured ?? false,
    };
}

function getAttachmentCreatePayload(attachment: PartialAttachmentForm, index: number) {
    if (!(attachment.file instanceof File)) {
        return undefined;
    }

    return {
        order: index + 1,
        label: attachment.label ?? '',
        file: attachment.file,
    };
}

function getAttachmentUpdatePayload(attachment: PartialAttachmentForm, index: number) {
    return {
        order: index + 1,
        label: attachment.label ?? '',
        ...(attachment.file instanceof File ? { file: attachment.file } : {}),
    };
}

function NewsForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const { canEditContent } = usePermissions();
    const alert = useAlert();

    const [{ data: directives }] = useDirectiveQuery();

    const [{ data, fetching: newsDetailFetch }] = useNewsDetailQuery({
        variables: { id: (id ?? '') },
        pause: !id,
        requestPolicy: 'network-only',
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
    const keyStatErrors = getErrorObject(error?.keyStats);
    const attachmentErrors = getErrorObject(error?.attachments);

    const {
        setValue: onActionLinkChange,
        removeValue: onActionLinkRemove,
    } = useFormArray<'actionLinks', PartialActionLinkForm>('actionLinks', setFieldValue);

    const {
        setValue: onKeyStatChange,
        removeValue: onKeyStatRemove,
    } = useFormArray<'keyStats', PartialKeyStatForm>('keyStats', setFieldValue);

    const {
        setValue: onAttachmentChange,
        removeValue: onAttachmentRemove,
    } = useFormArray<'attachments', PartialAttachmentForm>('attachments', setFieldValue);

    const handleMutationResponse = useCallback((result: MutationResponse) => {
        if (result?.ok) {
            bypassUnsavedModal();
            navigate('news');
            alert.show(
                `News ${id ? 'updated' : 'created'} successfully`,
                { variant: 'success' },
            );
        } else if (result?.errors) {
            setError(result.errors);
            alert.show(result.errors.message ?? errorMessage, { variant: 'danger' });
        }
    }, [id, navigate, alert, setError, bypassUnsavedModal]);

    const handleUpdate = useCallback(async (
        newsId: string,
        mutationData: PartialFormType,
    ) => {
        const actionLinks: ActionLinkInput[] = getItemsToMutate(
            mutationData.actionLinks ?? [],
            data?.newsItem?.actionLinks ?? [],
            getActionLinkPayload,
            getActionLinkPayload,
        );
        const keyStats: KeyStatInput[] = getItemsToMutate(
            mutationData.keyStats ?? [],
            data?.newsItem?.keyStats ?? [],
            getKeyStatPayload,
            getKeyStatPayload,
        );
        const attachments: NewsAttachmentInput[] = getItemsToMutate(
            mutationData.attachments ?? [],
            data?.newsItem?.attachments ?? [],
            getAttachmentCreatePayload,
            getAttachmentUpdatePayload,
        );
        const res = await updateNewsMutate({
            pk: newsId,
            data: {
                ...getDataToSubmit(mutationData),
                actionLinks,
                keyStats,
                attachments,
            } as NewsUpdateInput,
        });
        handleMutationResponse(res.data?.updateNews);
    }, [
        data?.newsItem?.actionLinks,
        data?.newsItem?.keyStats,
        data?.newsItem?.attachments,
        updateNewsMutate,
        handleMutationResponse,
    ]);

    const handleCreate = useCallback(async (mutationData: PartialFormType) => {
        const res = await createNewsMutate({
            data: {
                ...getDataToSubmit(mutationData),
                actionLinks: getItemsToCreate(
                    mutationData.actionLinks ?? [],
                    getActionLinkPayload,
                ),
                keyStats: getItemsToCreate(
                    mutationData.keyStats ?? [],
                    getKeyStatPayload,
                ),
                attachments: getItemsToCreate(
                    mutationData.attachments ?? [],
                    getAttachmentCreatePayload,
                ),
            } as NewsCreateInput,
        });
        handleMutationResponse(res.data?.createNews);
    }, [createNewsMutate, handleMutationResponse]);

    const handleMutation = useCallback((mutationData: PartialFormType) => (
        id
            ? handleUpdate(id, mutationData)
            : handleCreate(mutationData)
    ), [id, handleUpdate, handleCreate]);

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
            keyStats,
            attachments,
            ...other
        } = removeNull(data.newsItem);

        const actionLinksWithClientId = (actionLinks ?? []).map((link) => ({
            ...link,
            clientId: randomString(),
        }));

        const keyStatsWithClientId = (keyStats ?? []).map((stat) => ({
            ...stat,
            clientId: randomString(),
        }));

        const attachmentsWithClientId = (attachments ?? []).map((row) => ({
            id: row.id,
            order: row.order,
            label: row.label,
            file: row.file,
            clientId: randomString(),
        }));

        setValue({
            ...other,
            directive: directiveId,
            actionLinks: actionLinksWithClientId,
            keyStats: keyStatsWithClientId,
            attachments: attachmentsWithClientId,
        });
    }, [data, setValue]);

    const directiveOptions = useMemo(() => directives?.strategicDirectives.results.map(
        (directive) => ({
            id: directive.id,
            name: directive.title,
        }),
    ) ?? [], [directives]);

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

    const handleKeyStatAdd = useCallback(
        () => {
            const newKeyStat: PartialKeyStatForm = {
                clientId: randomString(),
                featured: false,
            };
            setFieldValue(
                (oldValue: PartialKeyStatForm[] | undefined) => (
                    [...(oldValue ?? []), newKeyStat]
                ),
                'keyStats',
            );
        },
        [setFieldValue],
    );

    const handleAttachmentsSelect = useCallback(
        (selected: File[] | undefined) => {
            if (isNotDefined(selected) || selected.length === 0) {
                return;
            }

            const maxBytes = MAX_NEWS_ATTACHMENT_SIZE_IN_MB * BYTES_PER_MEGA_BYTE;
            const tooLarge = selected.filter((each) => each.size > maxBytes);
            const withinSize = selected.filter((each) => each.size <= maxBytes);

            if (tooLarge.length > 0) {
                alert.show(
                    `Some files are larger than ${MAX_NEWS_ATTACHMENT_SIZE_IN_MB} MB and were skipped.`,
                    {
                        variant: 'danger',
                        description: tooLarge.map((each) => each.name).join(', '),
                    },
                );
            }

            const remainingSlots = MAX_NEWS_ATTACHMENTS - (value.attachments ?? []).length;
            const accepted = withinSize.slice(0, Math.max(remainingSlots, 0));

            if (withinSize.length > accepted.length) {
                alert.show(
                    `Only ${MAX_NEWS_ATTACHMENTS} attachments are allowed, so some files were skipped.`,
                    { variant: 'danger' },
                );
            }

            if (accepted.length === 0) {
                return;
            }

            const newRows: PartialAttachmentForm[] = accepted.map((selectedFile) => ({
                clientId: randomString(),
                file: selectedFile,
            }));
            setFieldValue(
                (oldValue: PartialAttachmentForm[] | undefined) => (
                    [...(oldValue ?? []), ...newRows]
                ),
                'attachments',
            );
        },
        [setFieldValue, alert, value.attachments],
    );

    const attachmentLimitReached = (value.attachments ?? []).length >= MAX_NEWS_ATTACHMENTS;

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
                        disabled={createPending || updatePending}
                    >
                        Cancel
                    </Button>
                    <Button
                        name="save"
                        onClick={handleFormSubmit}
                        styleVariant="filled"
                        disabled={createPending || updatePending}
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
                        accept={ACCEPTED_IMAGE_TYPES}
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
                        keySelector={valueSelector}
                        labelSelector={labelSelector}
                        onChange={setFieldValue}
                        placeholder="Select Status"
                        error={error?.status}
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
                                error={actionLinkErrors?.[link.clientId]}
                            />
                        ))}
                        <Button name="add-link" onClick={handleCollectionAdd}>
                            Add Link
                        </Button>
                    </ListView>
                </InputSection>
                <InputSection
                    title="Key Stats"
                    description={`Figures shown alongside this news. At most ${MAX_FEATURED_KEY_STATS} can be featured; they appear in the order listed here.`}
                >
                    <ListView layout="block" spacing="sm">
                        <NonFieldError<PartialKeyStatForm[]> error={error?.keyStats} />
                        {(value.keyStats || []).map((stat, index) => (
                            <KeyStatInputComponent
                                key={stat.clientId}
                                index={index}
                                value={stat}
                                onChange={onKeyStatChange}
                                onRemove={onKeyStatRemove}
                                error={keyStatErrors?.[stat.clientId]}
                            />
                        ))}
                        <Button
                            name="add-key-stat"
                            onClick={handleKeyStatAdd}
                        >
                            Add Key Stat
                        </Button>
                    </ListView>
                </InputSection>
                <InputSection
                    title="Attachments"
                    description={`Files offered for download with this news. At most ${MAX_NEWS_ATTACHMENTS}; they appear in the order listed here.`}
                >
                    <ListView layout="block" spacing="sm">
                        <NonFieldError<PartialAttachmentForm[]> error={error?.attachments} />
                        <RawFileInput
                            name={undefined}
                            multiple
                            onChange={handleAttachmentsSelect}
                            accept={ACCEPTED_FILE_TYPES}
                            disabled={attachmentLimitReached}
                            colorVariant="primary"
                            styleVariant="outline"
                            before={<UploadFillIcon />}
                        >
                            Upload Files
                        </RawFileInput>
                        {(value.attachments || []).map((row, index) => (
                            <AttachmentInputComponent
                                key={row.clientId}
                                index={index}
                                value={row}
                                onChange={onAttachmentChange}
                                onRemove={onAttachmentRemove}
                                error={attachmentErrors?.[row.clientId]}
                            />
                        ))}
                    </ListView>
                </InputSection>
            </ListView>
            {unsavedModal}
        </Container>
    );
}

export default NewsForm;
