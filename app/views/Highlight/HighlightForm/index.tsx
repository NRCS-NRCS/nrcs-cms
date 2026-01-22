import {
    Activity,
    useCallback,
    useEffect,
} from 'react';
import { IoRemoveCircleOutline } from 'react-icons/io5';
import {
    useNavigate,
    useParams,
} from 'react-router';
import {
    Button,
    Checkbox,
    Heading,
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
    type Error,
    getErrorObject,
    ObjectSchema,
    PartialForm,
    removeNull,
    requiredStringCondition,
    type SetValueArg,
    urlCondition,
    useForm,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';

import ContainerWrapper from '#components/ContainerWrapper';
import FileUpload from '#components/FileUpload';
import FormSection from '#components/FormSection';
import Page from '#components/Page';
import {
    ActionLinkInput,
    ActionLinkType,
    HighlightCreateInput,
    useCreateHighlightMutation,
    useHighlightDetailQuery,
    useUpdateHighlightMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import urlToFile from '#utils/urlToFile';

import styles from './styles.module.css';

interface ActionLinkFormValue extends ActionLinkType {
    clientId: string;
}
interface CollectionInputProps {
    value: PartialForm<ActionLinkFormValue>;
    error: Error<ActionLinkFormValue> | undefined;
    onChange: (value: SetValueArg<PartialForm<ActionLinkFormValue>>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
}
type PartialFormType = Omit<PartialForm<HighlightCreateInput>, 'actionLinks'> & {
    actionLinks?: PartialForm<ActionLinkFormValue>[];
    createdBy: string;
    modifiedBy: string;
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
            required: false,
        },
        actionLinks: {
            keySelector: (col) => col.clientId ?? '',
            member: (): ActionLinksSchemaMember => ({
                fields: (): ActionLinkSchemaFields => ({
                    clientId: {},
                    id: {},
                    label: {
                        required: false,
                        requiredValidation: requiredStringCondition,
                    },
                    url: {
                        required: false,
                        validations: [urlCondition],
                        requiredValidation: requiredStringCondition,
                    },
                }),
            }),

        },
        isActive: {
            required: true,
        },
        createdBy: {},
        modifiedBy: {},
    }),
};

const defaultEditFormValue: PartialFormType = {
    createdBy: '',
    modifiedBy: '',
    actionLinks: [{ clientId: randomString() }],
};

const defaultActionLinkValue: PartialForm<ActionLinkFormValue> = { clientId: '' };

function ActionLinkInputComponent(props: CollectionInputProps) {
    const {
        value,
        error: riskyError,
        onChange,
        onRemove,
        index,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultActionLinkValue);

    const error = getErrorObject(riskyError);

    return (
        <div key={index} className={styles.actionLinkRow}>
            <TextInput
                name="url"
                value={value.url ?? ''}
                placeholder="URL"
                error={error?.url as string}
                onChange={onFieldChange}
            />
            <TextInput
                name="label"
                value={value.label ?? ''}
                error={error?.label as string}
                placeholder="Label"
                onChange={onFieldChange}
            />
            <Button
                name={index}
                onClick={onRemove}
                variant="tertiary"
            >
                <IoRemoveCircleOutline />
            </Button>
        </div>
    );
}

function HighlightForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const alert = useAlert();

    const [{ data }] = useHighlightDetailQuery({
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

    const handleFormSubmit = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            async (val) => {
                const currentLinks = val.actionLinks ?? [];
                const originalLinks = data?.highlight?.actionLinks ?? [];
                if (id) {
                    const actionLinksMutation: ActionLinkInput[] = currentLinks.map((link) => {
                        const label = link.label ?? '';
                        const url = link.url ?? '';
                        if (!link.id) {
                            return {
                                create: { label, url },
                            };
                        }
                        return {
                            update: { id: link.id!, label, url },
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
                            heading: val.heading ?? '',
                            description: val.description ?? '',
                            image: val.image,
                            isActive: val.isActive ?? false,
                            actionLinks: actionLinksMutation,
                        },
                    });
                    if (res.data?.updateHighlight?.ok) {
                        navigate('/highlights');
                        alert.show('Highlight updated successfully', { variant: 'success' });
                    } else if (res.data?.updateHighlight?.errors) {
                        const errorMessages = res.data?.updateHighlight?.errors;
                        setError(res.data.updateHighlight.errors);
                        alert.show(errorMessages, { variant: 'danger' });
                    }
                } else {
                    const res = await createHighlightMutate({
                        data: {
                            heading: val.heading ?? '',
                            description: val.description ?? '',
                            image: val.image,
                            isActive: val.isActive ?? false,
                            actionLinks: currentLinks.map((l) => ({
                                label: l.label ?? '',
                                url: l.url ?? '',
                            })),
                        },
                    });
                    if (res.data?.createHighlight?.ok) {
                        navigate('/highlights');
                        alert.show('Highlight created successfully', { variant: 'success' });
                    } else if (res.data?.createHighlight?.errors) {
                        const errorMessages = res.data?.createHighlight?.errors;
                        setError(res.data.createHighlight.errors);
                        alert.show(errorMessages, { variant: 'danger' });
                    }
                }
            },
        );
        handler();
    }, [data, id, alert,
        validate, setError, updateHighlightMutate, createHighlightMutate, navigate]);

    useEffect(() => {
        if (isNotDefined(data?.highlight)) {
            return;
        }
        const {
            modifiedBy,
            createdBy,
            image,
            ...other
        } = removeNull(data.highlight);

        setValue({
            ...other,
            modifiedBy: `${modifiedBy.firstName} ${modifiedBy.lastName}`,
            createdBy: `${createdBy.firstName} ${createdBy.lastName}`,
        });

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

    return (
        <Page>
            <ContainerWrapper>
                <FormSection headingLevel={3} label={id ? 'HIGHLIGHT DETAILS' : 'CREATE HIGHLIGHT'} />
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
                <FormSection label="Heading" description="Enter the Heading name of the highlight" withAsteriskOnTitle>
                    <TextInput
                        name="heading"
                        autoFocus
                        value={value.heading}
                        error={error?.heading as string}
                        onChange={setFieldValue}
                        placeholder="heading"
                    />
                </FormSection>
                <FormSection label="Description" description="Enter the description" withAsteriskOnTitle>
                    <TextArea
                        name="description"
                        value={value.description}
                        error={error?.description as string}
                        onChange={setFieldValue}
                        placeholder="description"

                    />
                </FormSection>
                <FormSection label="isActive" description="Click on the checkbox if the blog is to be featured">
                    <Checkbox
                        name="isActive"
                        label="isActive"
                        onChange={setFieldValue}
                        value={value.isActive}
                        error={error?.isActive}
                    />
                </FormSection>
                <FormSection label="Image" description="Add a cover photo, which will be displayed on top" withAsteriskOnTitle>
                    <FileUpload
                        name="audioFile"
                        onChange={(files) => setFieldValue(files, 'image')}
                        value={value.image}
                        error={error?.image as string}
                    />
                </FormSection>
                <FormSection label="Action Link" description="Add link to the highlight and the name to be displayed for the URL">
                    <div>
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
                        <Button name="add-link" onClick={handleCollectionAdd} variant="primary">
                            Add Link
                        </Button>
                    </div>
                </FormSection>
                <FormSection>
                    <Button name="save" onClick={handleFormSubmit} variant="primary">
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </FormSection>
            </ContainerWrapper>
        </Page>
    );
}

export default HighlightForm;
