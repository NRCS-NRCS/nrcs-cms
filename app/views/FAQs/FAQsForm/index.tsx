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
    Heading,
    NumberInput,
    TextArea,
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

import ContainerWrapper from '#components/ContainerWrapper';
import FormSection from '#components/FormSection';
import Page from '#components/Page';
import {
    FaqCreateInput,
    useCreateFaqMutation,
    useFaqDetailQuery,
    useUpdateFaqMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';

type PartialFormType = PartialForm<FaqCreateInput> &
{ createdBy: string, modifiedBy: string }

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const FAQSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        question: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        answer: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        orderIndex: {
            required: true,
            requiredValidation: integerCondition,
        },
        createdBy: {},
        modifiedBy: {},

    }),
};

const defaultEditFormValue: PartialFormType = {
    createdBy: '',
    modifiedBy: '',
};
function FAQsForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const alert = useAlert();

    const [{ data }] = useFaqDetailQuery({
        variables: { id: id || '' }, pause: !id,
    });
    const [{ fetching: createPending }, createFaqMutate] = useCreateFaqMutation();
    const [{ fetching: updatePending }, updateFaqMutate] = useUpdateFaqMutation();
    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
    } = useForm(FAQSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const handleFormSubmit = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            async (val) => {
                const mutateData = {
                    answer: val.answer ?? '',
                    question: val.question ?? '',
                    orderIndex: val.orderIndex ?? 0,
                };
                if (id) {
                    const res = await updateFaqMutate({
                        pk: id,
                        data: mutateData,
                    });
                    if (res.data?.updateFaq?.ok) {
                        navigate('/faqs');
                        alert.show('FAQ updated successfully', { variant: 'success' });
                    } else if (res.data?.updateFaq.errors) {
                        const errorMessages = res.data?.updateFaq?.errors;
                        setError(res.data.updateFaq.errors);
                        alert.show(errorMessages, { variant: 'danger' });
                    }
                } else {
                    const res = await createFaqMutate({
                        data: mutateData,
                    });

                    if (res.data?.createFaq.ok) {
                        navigate('/faqs');
                        alert.show('FAQ created successfully', { variant: 'success' });
                    } else if (res.data?.createFaq?.errors) {
                        const errorMessages = res.data?.createFaq?.errors;
                        setError(res.data.createFaq.errors);
                        alert.show(errorMessages, { variant: 'danger' });
                    }
                }
            },
        );
        handler();
    }, [setError, validate, alert, id, createFaqMutate, updateFaqMutate, navigate]);

    useEffect(() => {
        if (data?.faq) {
            const { faq } = data;
            setFieldValue(faq.answer, 'answer');
            setFieldValue(faq.question, 'question');
            setFieldValue(faq.orderIndex, 'orderIndex');
            setFieldValue(`${faq.modifiedBy.firstName} ${faq.modifiedBy.lastName}`, 'modifiedBy');
            setFieldValue(`${faq.createdBy.firstName} ${faq.createdBy.lastName}`, 'createdBy');
        }
    }, [data, setFieldValue]);
    return (
        <Page>
            <ContainerWrapper>
                <FormSection headingLevel={3} label={id ? 'FAQs DETAIL' : 'CREATE FAQ'} />
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
                <FormSection label="Question*" description="Enter the question">
                    <TextArea
                        name="question"
                        value={value.question}
                        error={error?.question as string}
                        onChange={setFieldValue}
                        placeholder="question"
                        autoFocus
                    />
                </FormSection>
                <FormSection label="Answer*" description="Write the answer of the question">
                    <TextArea
                        name="answer"
                        value={value.answer}
                        onChange={setFieldValue}
                        error={error?.answer as string}
                        placeholder="answer"
                    />
                </FormSection>
                <FormSection label="Order Index*" description="Write the question number in numeric ">
                    <NumberInput
                        name="orderIndex"
                        value={value.orderIndex ?? 0}
                        onChange={setFieldValue}
                        error={error?.orderIndex}
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

export default FAQsForm;
