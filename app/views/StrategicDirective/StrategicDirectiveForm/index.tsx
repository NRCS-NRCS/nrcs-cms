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
import { AddLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Heading,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import { randomString } from '@togglecorp/fujs';
import {
    ArraySchema,
    createSubmitHandler,
    Error,
    getErrorObject,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    SetValueArg,
    useForm,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';

import ContainerWrapper from '#components/ContainerWrapper';
import FileUpload from '#components/FileUpload';
import FormSection from '#components/FormSection';
import Page from '#components/Page';
import {
    MajorResponsibilitiesInput,
    StrategicDirectivesCreateInput,
    useCreateStrategicDirectiveMutation,
    useStrategicDirectiveDetailQuery,
    useUpdateStrategicDirectiveMutation,
} from '#generated/types/graphql';
import urlToFile from '#utils/urlToFile';

import styles from './styles.module.css';

type PartialFormType = PartialForm<StrategicDirectivesCreateInput> &
{ createdBy: string, modifiedBy: string }

type MajorResponsibilitiesType = NonNullable<NonNullable<PartialFormType['majorResponsibilities']>>[number] & {
    clientId?: string
    id?: string
};
type ExtendedPartialFormType = Omit<PartialFormType, 'majorResponsibilities'> & {
    majorResponsibilities?: MajorResponsibilitiesType[];
};
type FormSchema = ObjectSchema<ExtendedPartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type MajorResponsibilitiesSchema = ObjectSchema<PartialForm<MajorResponsibilitiesType>,
    ExtendedPartialFormType>;
type MajorResponsibilitiesFields = ReturnType<MajorResponsibilitiesSchema['fields']>;
type MajorResponsibilitySchema = ArraySchema<PartialForm<MajorResponsibilitiesType>,
    ExtendedPartialFormType>;
type MajorResponsibilitySchemaMember = ReturnType<MajorResponsibilitySchema['member']>;

const EditBlogSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        description: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        coverImage: {
            required: true,
        },
        majorResponsibilities: {
            keySelector: (col) => col.clientId ?? '',
            member: (): MajorResponsibilitySchemaMember => ({
                fields: (): MajorResponsibilitiesFields => ({
                    clientId: {},
                    id: {},
                    description: {
                        required: true,
                        requiredValidation: requiredStringCondition,
                    },
                    title: {
                        required: true,
                        requiredValidation: requiredStringCondition,
                    },
                }),
            }),
        },
        createdBy: {},
        modifiedBy: {},

    }),
};

const defaultEditFormValue: ExtendedPartialFormType = {
    createdBy: '',
    modifiedBy: '',
    majorResponsibilities: [{ clientId: randomString(), id: '' }],

};

interface CollectionInputProps {
    value: PartialForm<MajorResponsibilitiesType>;
    error: Error<MajorResponsibilitiesType> | undefined;
    onChange: (value: SetValueArg<PartialForm<MajorResponsibilitiesType>>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
}

const defaultActionLinkValue: PartialForm<MajorResponsibilitiesType> = { clientId: '' };

function MajorResponsibilities(props: CollectionInputProps) {
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
        <div key={index} className={styles.majorResponsibilities}>
            <div className={styles.majorResponsibilitiesHeader}>
                <TextInput
                    name="title"
                    value={value.title ?? ''}
                    placeholder="Title"
                    error={error?.title as string}
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
            <TextArea
                name="description"
                value={value.description ?? ''}
                error={error?.description as string}
                placeholder="Description"
                onChange={onFieldChange}
            />
        </div>
    );
}

function StrategicDirectiveForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [{ data }] = useStrategicDirectiveDetailQuery({
        variables: { id: id || '' }, pause: !id,
    });
    const [{ fetching: createPending },
        createStrategicDirectiveMutate] = useCreateStrategicDirectiveMutation();
    const [{ fetching: updatePending },
        updateStrategicDirectiveMutate] = useUpdateStrategicDirectiveMutation();
    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
    } = useForm(EditBlogSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);
    const errorMR = getErrorObject(error?.majorResponsibilities);
    const {
        setValue: onMajorResponsibilitiesChange,
        removeValue: onMajorResponsibilitiesRemove,
    } = useFormArray<'majorResponsibilities', PartialForm<MajorResponsibilitiesType>>('majorResponsibilities', setFieldValue);

    const handleFormSubmit = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            async (val) => {
                const currentLinks = val.majorResponsibilities ?? [];
                const originalLinks = data?.strategicDirective.majorResponsibilities ?? [];

                const mutateData = {
                    coverImage: val.coverImage ?? null,
                    title: val.title ?? '',
                    description: val.description ?? '',
                };
                if (id) {
                    const majorResponsibilitiesList:
                        MajorResponsibilitiesInput[] = currentLinks.map((link) => {
                            const description = link.description ?? '';
                            const title = link.title ?? '';
                            if (!link.id) {
                                return {
                                    create: { title, description },
                                };
                            }
                            return {
                                update: { id: link.id!, title, description },
                            };
                        });
                    originalLinks.forEach((orig) => {
                        const exists = currentLinks.find((curr) => curr.id === orig.id);

                        if (!exists) {
                            majorResponsibilitiesList.push({
                                delete: { id: orig.id ?? '' },
                            });
                        }
                    });
                    const res = await updateStrategicDirectiveMutate({
                        pk: id,
                        data: {
                            ...mutateData,
                            majorResponsibilities: majorResponsibilitiesList,
                        },
                    });
                    if (res.data?.updateStrategicDirectives?.ok) {
                        navigate('/strategic-directive');
                    } else if (res.data?.updateStrategicDirectives.errors) {
                        setError(res.data.updateStrategicDirectives.errors);
                    }
                } else {
                    const res = await createStrategicDirectiveMutate({
                        data: {
                            ...mutateData,
                            majorResponsibilities: val
                                .majorResponsibilities?.map((resp) => ({
                                    description: resp.description ?? '',
                                    title: resp.title ?? '',
                                })),
                        },
                    });

                    if (res.data?.createStrategicDirectives.ok) {
                        navigate('/strategic-directive');
                    } else if (res.data?.createStrategicDirectives?.errors) {
                        setError(res.data.createStrategicDirectives.errors);
                    }
                }
            },
        );
        handler();
    }, [setError, validate, id, data,
        createStrategicDirectiveMutate, updateStrategicDirectiveMutate, navigate]);

    useEffect(() => {
        if (data?.strategicDirective) {
            const { strategicDirective } = data;
            if (strategicDirective.coverImage) {
                urlToFile(strategicDirective?.coverImage?.url, strategicDirective?.coverImage?.name)
                    .then((file) => {
                        setFieldValue(file, 'coverImage');
                    });
            }
            setFieldValue(strategicDirective?.title, 'title');
            setFieldValue(strategicDirective?.description, 'description');
            setFieldValue(strategicDirective?.majorResponsibilities, 'majorResponsibilities');
            setFieldValue(`${strategicDirective.modifiedBy?.firstName} ${strategicDirective.modifiedBy?.lastName}`, 'modifiedBy');
            setFieldValue(`${strategicDirective.createdBy?.firstName} ${strategicDirective.createdBy?.lastName}`, 'createdBy');
        }
    }, [data, setFieldValue]);

    const handleMRAdd = useCallback(
        () => {
            const clientId = randomString();

            const newActionLink: PartialForm<MajorResponsibilitiesType> = {
                clientId,
            };

            setFieldValue(
                (oldValue: PartialForm<MajorResponsibilitiesType>[] | undefined) => (
                    [...(oldValue ?? []), newActionLink]
                ),
                'majorResponsibilities',
            );
        },
        [setFieldValue],
    );

    return (
        <Page>
            <ContainerWrapper>
                <FormSection headingLevel={3} label="STRATEGIC DIRECTIVE DETAILS" />
                <Activity mode={value.createdBy && value.modifiedBy ? 'hidden' : 'visible'}>
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
                <FormSection label="Title" description="Enter the Title" withAsteriskOnTitle>
                    <TextInput
                        name="title"
                        value={value.title}
                        error={error?.title as string}
                        onChange={setFieldValue}
                    />
                </FormSection>
                <FormSection label="Cover Image" description="Add a Cover Image, which will be attached and shown on StrategicDirective" withAsteriskOnTitle>
                    <FileUpload
                        name="coverImage"
                        onChange={(files) => setFieldValue(files, 'coverImage')}
                        value={value.coverImage}
                    />
                </FormSection>
                <FormSection label="Description" description="Enter the Description" withAsteriskOnTitle>
                    <TextArea
                        name="description"
                        value={value.description}
                        error={error?.description as string}
                        onChange={setFieldValue}
                    />
                </FormSection>
                <FormSection label="Major Responsibilities" description="Define the key responsibilities required to implement this strategic directive. Focus on core actions, accountability, and expected outcomes.">
                    <div>
                        {value.majorResponsibilities
                            && value.majorResponsibilities.map((val, i) => (
                                <MajorResponsibilities
                                    value={val}
                                    error={errorMR?.[val.clientId ?? 0]}
                                    onChange={onMajorResponsibilitiesChange}
                                    onRemove={onMajorResponsibilitiesRemove}
                                    index={i}
                                />
                            ))}
                        <Button name="add-link" onClick={handleMRAdd} variant="secondary">
                            <AddLineIcon />
                            {' '}
                            Add
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

export default StrategicDirectiveForm;
