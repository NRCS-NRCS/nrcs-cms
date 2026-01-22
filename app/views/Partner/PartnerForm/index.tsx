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
    Heading,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import {
    createSubmitHandler,
    getErrorObject,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import ContainerWrapper from '#components/ContainerWrapper';
import FileUpload from '#components/FileUpload';
import FormSection from '#components/FormSection';
import Page from '#components/Page';
import {
    PartnerCreateInput,
    PartnerScopeEnum,
    useCreatePartnerMutation,
    usePartnerDetailQuery,
    useUpdatePartnerMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import urlToFile from '#utils/urlToFile';

type PartialFormType = PartialForm<PartnerCreateInput> &
{ createdBy: string, modifiedBy: string }

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const PartnerSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        scope: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        image: {
            required: true,
        },
        createdBy: {},
        modifiedBy: {},

    }),
};

const defaultEditFormValue: PartialFormType = {
    createdBy: '',
    modifiedBy: '',
};
function PartnerForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const alert = useAlert();

    const [{ data }] = usePartnerDetailQuery({
        variables: { id: id || '' }, pause: !id,
    });
    const [{ fetching: createPending }, createPartnerMutate] = useCreatePartnerMutation();
    const [{ fetching: updatePending }, updatePartnerMutate] = useUpdatePartnerMutation();
    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
    } = useForm(PartnerSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const handleFormSubmit = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            async (val) => {
                const mutateData = {
                    image: val.image ?? '',
                    title: val.title ?? '',
                    scope: val.scope as PartnerScopeEnum,
                };
                if (id) {
                    const res = await updatePartnerMutate({
                        pk: id,
                        data: mutateData,
                    });
                    if (res.data?.updatePartner?.ok) {
                        navigate('/partners');
                        alert.show('Partner updated successfully', { variant: 'success' });
                    } else if (res.data?.updatePartner.errors) {
                        setError(res.data.updatePartner.errors);
                        const errorMessages = res.data?.updatePartner?.errors;
                        alert.show(errorMessages, { variant: 'danger' });
                    }
                } else {
                    const res = await createPartnerMutate({
                        data: mutateData,
                    });

                    if (res.data?.createPartner.ok) {
                        navigate('/partners');
                        alert.show('Partner created successfully', { variant: 'success' });
                    } else if (res.data?.createPartner?.errors) {
                        const errorMessages = res.data?.createPartner?.errors;
                        setError(res.data.createPartner.errors);
                        alert.show(errorMessages, { variant: 'danger' });
                    }
                }
            },
        );
        handler();
    }, [setError, alert, validate, id, createPartnerMutate, updatePartnerMutate, navigate]);

    useEffect(() => {
        if (data?.partner) {
            const { partner } = data;
            if (partner.image) {
                urlToFile(partner.image.url, partner.image.name)
                    .then((file) => {
                        setFieldValue(file, 'image');
                    });
            }
            setFieldValue(partner.title, 'title');
            setFieldValue(partner.scope, 'scope');
            setFieldValue(partner.image, 'image');
            setFieldValue(`${partner.modifiedBy.firstName} ${partner.modifiedBy.lastName}`, 'modifiedBy');
            setFieldValue(`${partner.createdBy.firstName} ${partner.createdBy.lastName}`, 'createdBy');
        }
    }, [data, setFieldValue]);

    const scopeOptions = useMemo(() => Object.values(PartnerScopeEnum).map((scope) => ({
        value: scope,
        label: scope,
    })), []);

    return (
        <Page>
            <ContainerWrapper>
                <FormSection headingLevel={3} label="PARTNER DETAILS" />
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
                <FormSection label="Title" description="Enter the title name of the Partner" withAsteriskOnTitle>
                    <TextInput
                        name="title"
                        value={value.title}
                        error={error?.title as string}
                        onChange={setFieldValue}
                        placeholder="title"
                        autoFocus
                    />
                </FormSection>
                <FormSection label="Status" description="Add status to either global or local" withAsteriskOnTitle>
                    <SelectInput
                        name="scope"
                        options={scopeOptions}
                        value={value.scope}
                        keySelector={(o) => o.label}
                        labelSelector={(o) => o.value}
                        onChange={setFieldValue}
                        placeholder="Select Status"
                        error={error?.scope}
                    />
                </FormSection>
                <FormSection label="Partner Logo*" description="Add a Partner Logo, which will be displayed in Partner Section" withAsteriskOnTitle>
                    <FileUpload
                        name="image"
                        onChange={(files) => setFieldValue(files, 'image')}
                        value={value.image}
                        error={error?.image as string}
                    />
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

export default PartnerForm;
