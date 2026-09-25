/* eslint-disable @typescript-eslint/no-unused-vars, import/prefer-default-export */
import { gql } from 'urql';

export const CEC_MEMBER_QUERY = gql`
    query CecMember($filters: CecMemberFilter) {
        cecMembers(pagination: { limit: 100 }, filters: $filters, ordering: [{ orderIndex: ASC }]) {
            totalCount
            results {
                id
                name
                memberType
                designation
                email
                contactNumber
                isActive
                orderIndex
            }
        }
    }
`;

const CEC_MEMBER_DETAIL = gql`
    query CecMemberDetail($id: ID!) {
        cecMember(id: $id) {
            id
            name
            memberType
            designation
            email
            secondaryEmail
            address
            contactNumber
            isActive
            photo {
                name
                size
                url
            }
            createdBy {
                id
                firstName
                lastName
            }
            modifiedBy {
                id
                firstName
                lastName
            }
        }
    }
`;

const CREATE_CEC_MEMBER_MUTATION = gql`
    mutation CreateCecMember($data: CecMemberCreateInput!) {
        createCecMember(data: $data) {
            ... on CecMemberTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const UPDATE_CEC_MEMBER_MUTATION = gql`
    mutation UpdateCecMember($pk: ID!, $data: CecMemberUpdateInput!) {
        updateCecMember(pk: $pk, data: $data) {
            ... on CecMemberTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const DELETE_CEC_MEMBER = gql`
    mutation DeleteCecMember($id: ID!) {
        deleteCecMember(data: { id: $id }) {
            ... on OperationInfo {
                __typename
                messages {
                    message
                }
            }
            ... on CecMemberType {
                id
            }
        }
    }
`;

const REORDER_CEC_MEMBER_MUTATION = gql`
    mutation ReorderCecMember($data: CecMemberReorderInput!) {
        reorderCecMember(data: $data) {
            ... on CecMemberTypeListMutationResponseType {
                __typename
                errors
                ok
                result {
                    id
                    orderIndex
                }
            }
        }
    }
`;
