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
    BlockLoading,
    Button,
    Container,
    Heading,
    InputSection,
    ListView,
    NumberInput,
    TextArea,
} from '@ifrc-go/ui';
import { isNotDefined } from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    integerCondition,
    ObjectSchema,
    PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import {
    FaqCreateInput,
    FaqUpdateInput,
    useCreateFaqMutation,
    useFaqDetailQuery,
    useUpdateFaqMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';

type PartialFormType = PartialForm<FaqCreateInput>

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
    }),
};

const defaultEditFormValue: PartialFormType = {};

function FAQsForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const alert = useAlert();

    const [{ data, fetching: faqDetailFetch }] = useFaqDetailQuery({
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
        setValue,
    } = useForm(FAQSchema, { value: defaultEditFormValue });

    const error = getErrorObject(formError);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = '/faqs';
        const alertMessage = `FAQ ${id ? 'updated' : 'created'} successfully`;
        const errorMessage = 'Something Went Wrong! ';

        if (id) {
            const res = await updateFaqMutate({
                pk: id,
                data: mutationData as FaqUpdateInput,
            });
            const result = res.data?.updateFaq;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        } else {
            const res = await createFaqMutate({
                data: mutationData as FaqCreateInput,
            });
            const result = res.data?.createFaq;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        }
    }, [alert, createFaqMutate, id, navigate, setError, updateFaqMutate]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            handleMutation,
        )(),
        [validate, setError, handleMutation],
    );

    useEffect(() => {
        if (isNotDefined(data?.faq)) {
            return;
        }
        const faqData = removeNull(data.faq);
        setValue({ ...faqData });
    }, [data, setValue]);

    if (faqDetailFetch) {
        return <BlockLoading withoutBorder compact message="Loading" />;
    }

    return (
        <Container withPadding>
            <ListView layout="block">
                <InputSection withoutTitleSection>
                    <Heading level={4}>
                        {id ? 'FAQs DETAIL' : 'CREATE FAQ'}
                    </Heading>
                </InputSection>
                <Activity mode={data?.faq.createdBy && data.faq.modifiedBy ? 'visible' : 'hidden'}>
                    <InputSection
                        title={`Created by: ${data?.faq.createdBy.firstName} ${data?.faq.createdBy.lastName}`}
                    >
                        <Heading level={6}>
                            Modified by:
                            {' '}
                            {data?.faq.modifiedBy.firstName}
                            {' '}
                            {data?.faq.modifiedBy.lastName}
                        </Heading>
                    </InputSection>
                </Activity>
                <InputSection
                    title="Question"
                    description="Enter the question"
                    withAsteriskOnTitle
                >
                    <TextArea
                        name="question"
                        value={value.question}
                        error={error?.question as string}
                        onChange={setFieldValue}
                        placeholder="question"
                        autoFocus
                    />
                </InputSection>
                <InputSection
                    title="Answer"
                    description="Write the answer of the question"
                    withAsteriskOnTitle
                >
                    <TextArea
                        name="answer"
                        value={value.answer}
                        onChange={setFieldValue}
                        error={error?.answer as string}
                        placeholder="answer"
                    />
                </InputSection>
                <InputSection
                    title="Order Index"
                    description="Write the question number in numeric"
                    withAsteriskOnTitle
                >
                    <NumberInput
                        name="orderIndex"
                        value={value.orderIndex ?? 0}
                        onChange={setFieldValue}
                        error={error?.orderIndex}
                    />
                </InputSection>
                <ListView withPadding withBackground withCenteredContents>
                    <Button name="save" onClick={handleFormSubmit} styleVariant="outline">
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </ListView>
            </ListView>
        </Container>
    );
}

export default FAQsForm;
