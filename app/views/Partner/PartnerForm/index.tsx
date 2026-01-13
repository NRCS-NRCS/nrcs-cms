import {
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
    Heading,
    NumberInput,
    RawFileInput,
    SelectInput,
    TextArea,
    TextInput,
} from '@ifrc-go/ui';
import {
    createSubmitHandler,
    getErrorObject,
    integerCondition,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import FormSection from '#components/FormSection';
import Page from '#components/Page';
import {
    PartnerCreateInput,
    PartnerScopeEnum,
    useCreatePartnerMutation,
    usePartnerDetailQuery,
    useUpdatePartnerMutation,
} from '#generated/types/graphql';
import urlToFile from '#utils/urlToFile';

import styles from './styles.module.css';

type PartialFormType = PartialForm<PartnerCreateInput> &
{ createdBy: string, modifiedBy: string }

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const EditBlogSchema: FormSchema = {
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
    } = useForm(EditBlogSchema, { value: defaultEditFormValue });

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
                    } else if (res.data?.updatePartner.errors) {
                        setError(res.data.updatePartner.errors);
                    }
                } else {
                    const res = await createPartnerMutate({
                        data: mutateData,
                    });

                    if (res.data?.createPartner.ok) {
                        navigate('/partners');
                    } else if (res.data?.createPartner?.errors) {
                        setError(res.data.createPartner.errors);
                    }
                }
            },
        );
        handler();
    }, [setError, validate, id, createPartnerMutate, updatePartnerMutate, navigate]);

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

    const scopeOptions = Object.values(PartnerScopeEnum).map((scope) => ({
        value: scope,
        label: scope,
    }));
    return (
        <Page>
            <Container
                className={styles.container}
                childrenContainerClassName={styles.containerChild}
            >
                <FormSection headingLevel={3} label="Partner DETAIL" />
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
                <FormSection label="Title*" description="Enter the question">
                    <TextInput
                        name="title"
                        value={value.title}
                        error={error?.title as string}
                        onChange={setFieldValue}
                    />
                </FormSection>

                <FormSection label="Status*" description="Add status to either draft, publish or archived">
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

                <FormSection label="Partner Logo*" description="Add a cover photo, which will be displayed on top">
                    <RawFileInput
                        name="image"
                        onChange={(files) => setFieldValue(files, 'image')}
                        variant="secondary"
                    >
                        Upload
                    </RawFileInput>
                    {value.image?.name && <p>{value.image.name}</p>}
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

export default PartnerForm;
