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
    Button,
    Container,
    DateInput,
    Heading,
    InputSection,
    ListView,
    TextArea,
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
import {
    ProcurementCreateInput,
    ProcurementUpdateInput,
    useCreateProcurementMutation,
    useProcurementDetailQuery,
    useUpdateProcurementMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import { errorMessage } from '#utils/common';
import urlToFile from '#utils/urlToFile';

type PartialFormType = PartialForm<ProcurementCreateInput>

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const ProcurementSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        publishedDate: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        expiryDate: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        description: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        file: {
            required: true,
        },

    }),
};

const defaultEditFormValue: PartialFormType = {};
function ProcurementForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const alert = useAlert();

    const [{ data }] = useProcurementDetailQuery({
        variables: { id: id || '' }, pause: !id,
    });
    const [{ fetching: createPending }, createProcurementMutate] = useCreateProcurementMutation();
    const [{ fetching: updatePending }, updateProcurementMutate] = useUpdateProcurementMutation();
    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
    } = useForm(ProcurementSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = '/procurements';
        const alertMessage = `Procurement ${id ? 'updated' : 'created'} successfully`;
        if (id) {
            const res = await updateProcurementMutate({
                pk: id,
                data: mutationData as ProcurementUpdateInput,
            });
            const result = res.data?.updateProcurement;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createProcurementMutate({
                data: mutationData as ProcurementCreateInput,
            });
            const result = res.data?.createProcurement;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        }
    }, [alert, createProcurementMutate, id, navigate, setError, updateProcurementMutate]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            handleMutation,
        )(),
        [validate, setError, handleMutation],
    );

    useEffect(() => {
        if (isNotDefined(data?.procurement)) {
            return;
        }
        const {
            file,
            ...other
        } = removeNull(data.procurement);

        setValue({
            ...other,
        });
        if (file) {
            urlToFile(file.url, file.name).then((fileData) => {
                setValue((prev) => ({
                    ...prev,
                    file: fileData,
                }));
            });
        }
    }, [data, setValue]);

    return (
        <Container withPadding>
            <ListView layout="block">
                <InputSection withoutTitleSection>
                    <Heading level={4}>
                        {id ? 'PROCUREMENT DETAILS' : 'CREATE PROCUREMENT'}
                    </Heading>
                </InputSection>
                <Activity mode={data?.procurement.createdBy && data.procurement.modifiedBy ? 'visible' : 'hidden'}>
                    <InputSection
                        title={`Created by: ${data?.procurement.createdBy.firstName} ${data?.procurement.createdBy.lastName}`}
                    >
                        <Heading level={6}>
                            Modified by:
                            {' '}
                            {data?.procurement.modifiedBy.firstName}
                            {' '}
                            {data?.procurement.modifiedBy.lastName}
                        </Heading>
                    </InputSection>
                </Activity>
                <InputSection title="Title" description="Enter the Title" withAsteriskOnTitle>
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
                    title="Procurement File"
                    description="Add a cover photo, which will be attached and displayed on top of your application"
                    withAsteriskOnTitle
                >
                    <FileUpload
                        name="file"
                        onChange={(files) => setFieldValue(files, 'file')}
                        value={value.file}
                        error={error?.file as string}
                    />
                </InputSection>
                <InputSection
                    title="Published Date"
                    description="This date should be the Published Date of the Procurement"
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
                    title="Expire Date"
                    description="This date should be the Expire Date of the Procurement"
                    withAsteriskOnTitle
                >
                    <DateInput
                        name="expiryDate"
                        value={value.expiryDate}
                        onChange={setFieldValue}
                        placeholder="Select Date"
                        error={error?.expiryDate as string}
                    />
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

export default ProcurementForm;
