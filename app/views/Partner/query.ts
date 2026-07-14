/* eslint-disable @typescript-eslint/no-unused-vars, import/prefer-default-export */
import { gql } from 'urql';

export const PARTNER_QUERY = gql`
    query Partner($pagination: OffsetPaginationInput, $filters: PartnerFilter) {
        partners(pagination: $pagination, filters: $filters) {
            pageInfo {
                limit
                offset
            }
            totalCount
            results {
                id
                image {
                    name
                    size
                    url
                }
                scope
                title
            }
        }
    }
`;

const PARTNER_DETAIL = gql`
    query PartnerDetail($id: ID!) {
        partner(id: $id) {
            title
            scope
            image {
                name
                size
                url
            }
            modifiedBy {
                id
                lastName
                firstName
            }
            id
            createdBy {
                id
                firstName
                lastName
            }
        }
    }
`;
const CREATE_PARTNER_MUTATION = gql`
    mutation CreatePartner($data: PartnerCreateInput!) {
        createPartner(data: $data) {
            ... on PartnerTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const UPDATE_PARTNER_MUTATION = gql`
    mutation UpdatePartner($pk: ID!, $data: PartnerUpdateInput!) {
        updatePartner(pk: $pk, data: $data) {
            ... on PartnerTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const DELETE_PARTNER = gql`
    mutation DeletePartner($id: ID!) {
        deletePartner(data: { id: $id }) {
            ... on OperationInfo {
                __typename
                messages {
                    message
                }
            }
            ... on PartnerType {
                id
            }
        }
    }
`;
