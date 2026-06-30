import {
    Activity,
    useCallback,
    useEffect,
} from 'react';
import {
    Navigate,
    useParams,
} from 'react-router';
import {
    BlockLoading,
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
    getErrorString,
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
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import { errorMessage } from '#utils/common';

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
    const navigate = useRouting();
    const { canEditContent } = usePermissions();
    const alert = useAlert();

    const [{ data, fetching: procurementDetailFetch }] = useProcurementDetailQuery({
        variables: { id: (id ?? '') }, pause: !id,
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
        const redirectPath = 'procurements';
        const alertMessage = `Procurement ${id ? 'updated' : 'created'} successfully`;
        const { file, ...otherMutationData } = mutationData;
        const dataToSubmit = {
            ...otherMutationData,
            file: file instanceof File ? file : undefined,
        };
        if (id) {
            const res = await updateProcurementMutate({
                pk: id,
                data: dataToSubmit as ProcurementUpdateInput,
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
                data: dataToSubmit as ProcurementCreateInput,
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
        setValue(removeNull(data.procurement));
    }, [data, setValue]);

    if (!canEditContent) {
        return <Navigate to="/procurements" replace />;
    }

    if (procurementDetailFetch) {
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
                        error={error?.title}
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
                        error={error?.description}
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
                        error={getErrorString(error?.file)}
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
                        error={getErrorString(error?.publishedDate)}
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
                        error={getErrorString(error?.expiryDate)}
                    />
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

export default ProcurementForm;
