import {
    Activity,
    useCallback,
    useEffect,
} from 'react';
import {
    useNavigate,
    useParams,
} from 'react-router';
import {
    BlockLoading,
    Button,
    Checkbox,
    Container,
    Heading,
    InputSection,
    ListView,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import {
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    ArraySchema,
    createSubmitHandler,
    getErrorObject,
    ObjectSchema,
    PartialForm,
    removeNull,
    requiredStringCondition,
    urlCondition,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import FileUpload from '#components/FileUpload';
import {
    ActionLinkInput,
    ActionLinkType,
    HighlightCreateInput,
    HighlightUpdateInput,
    useCreateHighlightMutation,
    useHighlightDetailQuery,
    useUpdateHighlightMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import urlToFile from '#utils/urlToFile';

import ActionLinkInputComponent from './actionLinkInput';

interface ActionLinkFormValue extends ActionLinkType {
    clientId: string;
}
type PartialFormType = Omit<PartialForm<HighlightCreateInput>, 'actionLinks'> & {
    actionLinks?: PartialForm<ActionLinkFormValue>[];
};

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type ActionLinkSchema = ObjectSchema<PartialForm<ActionLinkFormValue>, PartialFormType>;
type ActionLinkSchemaFields = ReturnType<ActionLinkSchema['fields']>;
type ActionLinksSchema = ArraySchema<PartialForm<ActionLinkFormValue>, PartialFormType>;
type ActionLinksSchemaMember = ReturnType<ActionLinksSchema['member']>;

const HighlightSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        heading: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        description: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        image: {
            required: true,
        },
        actionLinks: {
            keySelector: (col) => col.clientId ?? '',
            member: (): ActionLinksSchemaMember => ({
                fields: (): ActionLinkSchemaFields => ({
                    clientId: {},
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
        isActive: {
            required: true,
        },
    }),
};

const defaultEditFormValue: PartialFormType = {
    actionLinks: [{ clientId: randomString() }],
};

function HighlightForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const alert = useAlert();

    const [{ data, fetching: highlightDetailFetch }] = useHighlightDetailQuery({
        variables: { id: id || '' }, pause: !id,
    });
    const [{ fetching: createPending }, createHighlightMutate] = useCreateHighlightMutation();
    const [{ fetching: updatePending }, updateHighlightMutate] = useUpdateHighlightMutation();
    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
    } = useForm(HighlightSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const actionLinkErrors = getErrorObject(error?.actionLinks);

    const {
        setValue: onActionLinkChange,
        removeValue: onActionLinkRemove,
    } = useFormArray<'actionLinks', PartialForm<ActionLinkFormValue>>('actionLinks', setFieldValue);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = '/highlights';
        const alertMessage = `Highlight ${id ? 'updated' : 'created'} successfully`;
        const currentLinks = mutationData.actionLinks ?? [];
        const originalLinks = data?.highlight?.actionLinks ?? [];
        const errorMessage = 'Something Went Wrong! ';

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

            const res = await updateHighlightMutate({
                pk: id,
                data: {
                    ...mutationData,
                    actionLinks: removeNull(actionLinksMutation),
                } as HighlightUpdateInput,
            });
            const result = res.data?.updateHighlight;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createHighlightMutate({
                data: {
                    ...mutationData,
                    actionLinks: currentLinks.map((l) => ({
                        label: l.label ?? '',
                        url: l.url ?? '',
                    })),
                } as HighlightCreateInput,
            });
            const result = res.data?.createHighlight;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        }
    }, [alert, createHighlightMutate, id, navigate, setError, updateHighlightMutate, data]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            handleMutation,
        )(),
        [validate, setError, handleMutation],
    );

    useEffect(() => {
        if (isNotDefined(data?.highlight)) {
            return;
        }
        const {
            image,
            ...other
        } = removeNull(data.highlight);

        setValue({ ...other });

        if (image) {
            urlToFile(image.url, image.name).then((file) => {
                setValue((prev) => ({
                    ...prev,
                    image: file,
                }));
            });
        }
    }, [data, setValue]);

    const handleCollectionAdd = useCallback(
        () => {
            const clientId = randomString();
            const newActionLink: PartialForm<ActionLinkFormValue> = {
                clientId,
            };

            setFieldValue(
                (oldValue: PartialForm<ActionLinkFormValue>[] | undefined) => (
                    [...(oldValue ?? []), newActionLink]
                ),
                'actionLinks',
            );
        },
        [setFieldValue],
    );

    if (highlightDetailFetch) {
        return <BlockLoading withoutBorder compact message="Loading" />;
    }

    return (
        <Container withPadding>
            <ListView layout="block">
                <InputSection withoutTitleSection>
                    <Heading level={4}>
                        {id ? 'HIGHLIGHT DETAILS' : 'CREATE HIGHLIGHT'}
                    </Heading>
                </InputSection>
                <Activity mode={data?.highlight.createdBy && data.highlight.modifiedBy ? 'visible' : 'hidden'}>
                    <InputSection
                        title={`Created by: ${data?.highlight.createdBy.firstName} ${data?.highlight.createdBy.lastName}`}
                    >
                        <Heading level={6}>
                            Modified by:
                            {' '}
                            {data?.highlight.modifiedBy.firstName}
                            {' '}
                            {data?.highlight.modifiedBy.lastName}
                        </Heading>
                    </InputSection>
                </Activity>
                <InputSection
                    title="Heading"
                    description="Enter the Heading name of the highlight"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="heading"
                        autoFocus
                        value={value.heading}
                        error={error?.heading as string}
                        onChange={setFieldValue}
                        placeholder="heading"
                    />
                </InputSection>
                <InputSection
                    title="Description"
                    description="Enter the description"
                    withAsteriskOnTitle
                >
                    <TextArea
                        name="description"
                        value={value.description}
                        error={error?.description as string}
                        onChange={setFieldValue}
                        placeholder="description"

                    />
                </InputSection>
                <InputSection
                    title="isActive"
                    description="Click on the checkbox if the blog is to be featured"
                >
                    <Checkbox
                        name="isActive"
                        label="isActive"
                        onChange={setFieldValue}
                        value={value.isActive}
                        error={error?.isActive}
                    />
                </InputSection>
                <InputSection
                    title="Image"
                    description="Add a cover photo, which will be displayed on top"
                    withAsteriskOnTitle
                >
                    <FileUpload
                        name="image"
                        onChange={setFieldValue}
                        value={value.image}
                        error={error?.image as string}
                    />
                </InputSection>
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
                <ListView withPadding withBackground withCenteredContents>
                    <Button name="save" onClick={handleFormSubmit}>
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </ListView>
            </ListView>
        </Container>
    );
}

export default HighlightForm;
