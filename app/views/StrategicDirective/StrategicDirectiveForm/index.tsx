import {
    Activity,
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import { useParams } from 'react-router';
import { AddLineIcon } from '@ifrc-go/icons';
import {
    BlockLoading,
    Button,
    Container,
    Heading,
    InputSection,
    ListView,
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
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import FileUpload from '#components/FileUpload';
import MarkdownEditor from '#components/MarkdownEditor';
import {
    MajorResponsibilitiesInput,
    StrategicDirectivesCreateInput,
    useCreateStrategicDirectiveMutation,
    useStrategicDirectiveDetailQuery,
    useUpdateStrategicDirectiveMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import { errorMessage } from '#utils/common';
import urlToFile from '#utils/urlToFile';

import MajorResponsibilities from './majorResponsibilites';

type PartialFormType = PartialForm<StrategicDirectivesCreateInput>

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

const DirectiveSchema: FormSchema = {
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
    }),
};

const defaultEditFormValue: ExtendedPartialFormType = {
    majorResponsibilities: [],
};

function StrategicDirectiveForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const alert = useAlert();

    const [{ data, fetching: directiveDetailFetch }] = useStrategicDirectiveDetailQuery({
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
        setValue,
    } = useForm(DirectiveSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);
    const errorMR = getErrorObject(error?.majorResponsibilities);
    const {
        setValue: onMajorResponsibilitiesChange,
        removeValue: onMajorResponsibilitiesRemove,
    } = useFormArray<'majorResponsibilities', PartialForm<MajorResponsibilitiesType>>('majorResponsibilities', setFieldValue);

    const handleMutation = useCallback(async (mutationData: ExtendedPartialFormType) => {
        const redirectPath = 'strategicDirectives';
        const alertMessage = `Strategic Directive ${id ? 'updated' : 'created'} successfully`;
        const currentLinks = mutationData.majorResponsibilities ?? [];
        const originalLinks = data?.strategicDirective.majorResponsibilities ?? [];

        if (id) {
            const majorResponsibilitiesList:
                        MajorResponsibilitiesInput[] = currentLinks
                            .map((link) => {
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
                    ...mutationData,
                    majorResponsibilities: majorResponsibilitiesList,
                },
            });
            const result = res.data?.updateStrategicDirectives;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createStrategicDirectiveMutate({
                data: {
                    ...mutationData,
                    majorResponsibilities: mutationData
                        .majorResponsibilities?.map((resp) => ({
                            description: resp.description ?? '',
                            title: resp.title ?? '',
                        })),
                } as StrategicDirectivesCreateInput,
            });
            const result = res.data?.createStrategicDirectives;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        }
    }, [alert,
        createStrategicDirectiveMutate,
        id,
        navigate,
        setError,
        updateStrategicDirectiveMutate,
        data,
    ]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            handleMutation,
        )(),
        [validate, setError, handleMutation],
    );
    useEffect(() => {
        if (isNotDefined(data?.strategicDirective)) {
            return;
        }
        const {
            coverImage,
            ...other
        } = removeNull(data.strategicDirective);

        setValue({
            ...other,
        });
        if (coverImage) {
            urlToFile(coverImage.url, coverImage.name).then((coverImageData) => {
                setValue((prev) => ({
                    ...prev,
                    coverImage: coverImageData,
                }));
            });
        }
    }, [data, setValue]);

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

    const ContentEditor = useMemo(() => (
        <MarkdownEditor
            value={value.description}
            onChange={(val) => setFieldValue(val, 'description')}
            error={error?.description}
        />
    ), [value.description, error?.description, setFieldValue]);

    if (directiveDetailFetch) {
        return (
            <BlockLoading
                withoutBorder
                compact
                message="Loading"
            />
        );
    }

    return (
        <Container withPadding>
            <ListView layout="block">
                <InputSection withoutTitleSection>
                    <Heading level={4}>
                        {id ? 'STRATEGIC DIRECTIVE DETAILS' : 'CREATE STRATEGIC DIRECTIVE'}
                    </Heading>
                </InputSection>
                <Activity mode={data?.strategicDirective.createdBy && data.strategicDirective.modifiedBy ? 'visible' : 'hidden'}>
                    <InputSection
                        title={`Created by: ${data?.strategicDirective.createdBy.firstName} ${data?.strategicDirective.createdBy.lastName}`}
                    >
                        <Heading level={6}>
                            Modified by:
                            {' '}
                            {data?.strategicDirective.modifiedBy.firstName}
                            {' '}
                            {data?.strategicDirective.modifiedBy.lastName}
                        </Heading>
                    </InputSection>
                </Activity>
                <InputSection
                    title="Title"
                    description="Enter the Title"
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
                <InputSection title="Cover Image" description="Add a Cover Image, which will be attached and shown on StrategicDirective" withAsteriskOnTitle>
                    <FileUpload
                        name="coverImage"
                        onChange={setFieldValue}
                        value={value.coverImage}
                        error={error?.coverImage as string}
                    />
                </InputSection>
                <InputSection
                    title="Description"
                    description="Provide a detailed description of the strategic directive. This should outline the purpose, goals, and significance of the directive within the broader organizational strategy."
                    withAsteriskOnTitle
                >
                    {ContentEditor}
                </InputSection>
                <InputSection
                    title="Major Responsibilities"
                    description="Define the key responsibilities required to implement this strategic directive. Focus on core actions, accountability, and expected outcomes."
                >
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
                        <Button name="add-link" onClick={handleMRAdd}>
                            <AddLineIcon />
                            {' '}
                            Add
                        </Button>
                    </div>
                </InputSection>
                <ListView
                    withPadding
                    withBackground
                    withCenteredContents
                >
                    <Button name="save" onClick={handleFormSubmit}>
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </ListView>
            </ListView>
        </Container>
    );
}

export default StrategicDirectiveForm;
