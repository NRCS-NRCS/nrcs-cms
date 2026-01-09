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
    FaqCreateInput,
    useCreateFaqMutation,
    useFaqDetailQuery,
    useUpdateFaqMutation,
} from '#generated/types/graphql';

import styles from './styles.module.css';

type PartialFormType = PartialForm<FaqCreateInput> &
{ createdBy: string, modifiedBy: string }

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const EditBlogSchema: FormSchema = {
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
        createdBy: {
            required: false,
            requiredValidation: requiredStringCondition,
        },
        modifiedBy: {
            required: false,
            requiredValidation: requiredStringCondition,
        },

    }),
};

const defaultEditFormValue: PartialFormType = {
    createdBy: '',
    modifiedBy: '',
};
function FAQsForm() {
    const { id } = useParams();
    const navigate = useNavigate();
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
    } = useForm(EditBlogSchema, { value: defaultEditFormValue });

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
                    } else if (res.data?.updateFaq.errors) {
                        setError(res.data.updateFaq.errors);
                    }
                } else {
                    const res = await createFaqMutate({
                        data: mutateData,
                    });

                    if (res.data?.createFaq.ok) {
                        navigate('/faqs');
                    } else if (res.data?.createFaq?.errors) {
                        setError(res.data.createFaq.errors);
                    }
                }
            },
        );
        handler();
    }, [setError, validate, id, createFaqMutate, updateFaqMutate, navigate]);

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
                <FormSection label="Question*" description="Enter the question">
                    <TextArea
                        name="question"
                        value={value.question}
                        error={error?.question as string}
                        onChange={setFieldValue}
                    />
                </FormSection>
                <FormSection label="Answer*" description="Write the answer of the question">
                    <TextArea
                        name="answer"
                        value={value.answer}
                        onChange={setFieldValue}
                        error={error?.answer as string}
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
                <div className={styles.submitBtn}>
                    <Button name="save" onClick={handleFormSubmit} variant="primary">
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </div>
            </Container>
        </Page>
    );
}

export default FAQsForm;
