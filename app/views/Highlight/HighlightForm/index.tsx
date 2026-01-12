import {
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
    Container,
    Heading,
    RawFileInput,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import { randomString } from '@togglecorp/fujs';
import {
    ArraySchema,
    createSubmitHandler,
    type Error,
    getErrorObject,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    type SetValueArg,
    urlCondition,
    useForm,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';

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

                    await updateHighlightMutate({
                        pk: id,
                        data: {
                            heading: val.heading ?? '',
                            description: val.description ?? '',
                            image: val.image,
                            isActive: val.isActive ?? false,
                            actionLinks: actionLinksMutation,
                        },
                    });
                } else {
                    await createHighlightMutate({
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
                }
                navigate('/highlights');
            },
        );
        handler();
    }, [data, id, validate, setError, updateHighlightMutate, createHighlightMutate, navigate]);

    useEffect(() => {
        if (data?.highlight) {
            const { highlight } = data;
            if (highlight.image) {
                urlToFile(highlight.image.url, highlight.image.name)
                    .then((file) => {
                        setFieldValue(file, 'image');
                    });
            }
            const formattedLinks = highlight.actionLinks?.map((link) => ({
                id: link.id,
                label: link.label,
                url: link.url,
            })) ?? [];
            setFieldValue(formattedLinks, 'actionLinks');
            setFieldValue(highlight.heading, 'heading');
            setFieldValue(highlight.description, 'description');
            setFieldValue(highlight.isActive, 'isActive');
            setFieldValue(`${highlight.modifiedBy.firstName} ${highlight.modifiedBy.lastName}`, 'modifiedBy');
            setFieldValue(`${highlight.createdBy.firstName} ${highlight.createdBy.lastName}`, 'createdBy');
        }
    }, [data, setFieldValue]);

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
            <Container
                className={styles.container}
                childrenContainerClassName={styles.containerChild}
            >
                <FormSection headingLevel={3} label="FAQs DETAIL" />
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
                <FormSection label="Heading*" description="Enter the question">
                    <TextInput
                        name="heading"
                        value={value.heading}
                        error={error?.heading as string}
                        onChange={setFieldValue}
                    />
                </FormSection>
                <FormSection label="Description*" description="Enter the question">
                    <TextArea
                        name="description"
                        value={value.description}
                        error={error?.description as string}
                        onChange={setFieldValue}
                    />
                </FormSection>
                <FormSection label="isActive*" description="Click on the checkbox if the blog is to be featured">
                    <Checkbox
                        name="isActive"
                        label="isActive"
                        onChange={setFieldValue}
                        value={value.isActive}
                        error={error?.isActive}
                    />
                </FormSection>
                <FormSection label="Image*" description="Add a cover photo, which will be displayed on top">
                    <RawFileInput
                        name="image"
                        onChange={(files) => setFieldValue(files, 'image')}
                        variant="secondary"
                    >
                        Upload
                    </RawFileInput>
                    {value.image?.name && <p>{value.image.name}</p>}
                </FormSection>
                <FormSection label="Action Link*" description="Add link to the highlight and the name to be displayed for the URL">
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
                </FormSection>
                <div className={styles.submitBtn}>
                    <Button name="save" onClick={handleFormSubmit} variant="primary">
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </div>
            </Container>
        </Page>
    );
}

export default HighlightForm;
