/* eslint-disable @typescript-eslint/no-unused-vars, import/prefer-default-export */
import { gql } from 'urql';

export const FAQ_QUERY = gql`
    query FAQ($pagination: OffsetPaginationInput, $filters: FaqFilter) {
        faqs(pagination: $pagination, filters: $filters) {
            pageInfo {
                limit
                offset
            }
            totalCount
            results {
                question
                answer
                orderIndex
                id
            }
        }
    }
`;

const FAQ_DETAIL = gql`
    query FAQDetail($id: ID!) {
        faq(id: $id) {
            question
            orderIndex
            id
            answer
            createdBy {
                firstName
                lastName
            }
            modifiedBy {
                firstName
                lastName
            }
        }
    }
`;
const CREATE_FAQ_MUTATION = gql`
    mutation CreateFAQ($data: FaqCreateInput!) {
        createFaq(data: $data) {
            ... on FaqTypeMutationResponseType {
                __typename
                errors
                ok
            }
        }
    }
`;

const UPDATE_FAQ_MUTATION = gql`
    mutation UpdateFAQ($pk: ID!, $data: FaqUpdateInput!) {
        updateFaq(pk: $pk, data: $data) {
            ... on FaqTypeMutationResponseType {
                __typename
                errors
                ok
            }
        }
    }
`;

const DELETE_FAQ = gql`
    mutation DeleteFAQ($id: ID!) {
        deleteFaq(data: { id: $id }) {
            ... on OperationInfo {
                __typename
                messages {
                    message
                }
            }
            ... on FaqType {
                id
            }
        }
    }
`;
