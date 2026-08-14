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
    Heading,
    InputSection,
    ListView,
    TextArea,
} from '@ifrc-go/ui';
import { isNotDefined } from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    type ObjectSchema,
    type PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import {
    type FaqCreateInput,
    type FaqUpdateInput,
    useCreateFaqMutation,
    useFaqDetailQuery,
    useUpdateFaqMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePermissions from '#hooks/usePermissions';
import useRouting from '#hooks/useRouting';
import useUnsavedModal from '#hooks/useUnsavedModal';

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
    }),
};

const defaultEditFormValue: PartialFormType = {};

function FAQsForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const { canEditContent } = usePermissions();
    const alert = useAlert();

    const [{ data, fetching: faqDetailFetch }] = useFaqDetailQuery({
        variables: { id: (id ?? '') }, pause: !id,
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
        pristine,
    } = useForm(FAQSchema, { value: defaultEditFormValue });

    const {
        unsavedModal,
        bypassUnsavedModal,
    } = useUnsavedModal(!pristine);

    const error = getErrorObject(formError);

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = 'faqs';
        const alertMessage = `FAQ ${id ? 'updated' : 'created'} successfully`;
        const errorMessage = 'Something Went Wrong! ';

        if (id) {
            const res = await updateFaqMutate({
                pk: id,
                data: mutationData as FaqUpdateInput,
            });
            const result = res.data?.updateFaq;
            if (result?.ok) {
                bypassUnsavedModal();
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
                bypassUnsavedModal();
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        }
    }, [
        alert,
        bypassUnsavedModal,
        createFaqMutate,
        id,
        navigate,
        setError,
        updateFaqMutate,
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
        if (isNotDefined(data?.faq)) {
            return;
        }
        const faqData = removeNull(data.faq);
        setValue({ ...faqData });
    }, [data, setValue]);

    const handleCancelClick = useCallback(() => {
        navigate('faqs');
    }, [navigate]);

    if (!canEditContent) {
        return <Navigate to="/faqs" replace />;
    }

    if (faqDetailFetch) {
        return (
            <BlockLoading
                withoutBorder
                compact
                message="Loading"
            />
        );
    }

    return (
        <Container
            withPadding
            heading={id ? 'FAQs DETAIL' : 'CREATE FAQ'}
            headerDescription={id ? 'Review and update the details of this FAQ' : 'Fill in the details below to create a new FAQ'}
            footer={(
                <ListView
                    withFullWidth
                    withCenteredContents
                    withBackground
                    withPadding
                >
                    <Button
                        name={undefined}
                        onClick={handleCancelClick}
                    >
                        Cancel
                    </Button>
                    <Button
                        name="save"
                        onClick={handleFormSubmit}
                        styleVariant="filled"
                    >
                        {createPending || updatePending ? 'Saving' : 'Save'}
                    </Button>
                </ListView>
            )}
        >
            <ListView
                layout="block"
                spacing="lg"
            >
                <NonFieldError
                    error={formError}
                    withFallbackError
                />
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
                        error={error?.question}
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
                        error={error?.answer}
                        placeholder="answer"
                    />
                </InputSection>
            </ListView>
            {unsavedModal}
        </Container>
    );
}

export default FAQsForm;
