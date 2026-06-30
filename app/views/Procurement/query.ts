/* eslint-disable @typescript-eslint/no-unused-vars, import/prefer-default-export */
import { gql } from 'urql';

export const PROCUREMENT_QUERY = gql`
    query Procurement($pagination: OffsetPaginationInput, $filters: ProcurementFilter) {
        procurements(pagination: $pagination, filters: $filters) {
            pageInfo {
                limit
                offset
            }
            totalCount
            results {
                title
                publishedDate
                id
                expiryDate
            }
        }
    }
`;

const PROCUREMENT_DETAIL_QUERY = gql`
    query ProcurementDetail($id: ID!) {
        procurement(id: $id) {
            title
            publishedDate
            modifiedBy {
                firstName
                lastName
            }
            id
            file {
                name
                size
                url
            }
            expiryDate
            description
            createdBy {
                firstName
                lastName
            }
        }
    }
`;

const CREATE_PROCUREMENT_MUTATION = gql`
    mutation CreateProcurement($data: ProcurementCreateInput!) {
        createProcurement(data: $data) {
            ... on ProcurementTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const UPDATE_PROCUREMENT_MUTATION = gql`
    mutation UpdateProcurement($pk: ID!, $data: ProcurementUpdateInput!) {
        updateProcurement(pk: $pk, data: $data) {
            ... on ProcurementTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const DELETE_PROCUREMENT = gql`
    mutation DeleteProcurement($id: ID!) {
        deleteProcurement(data: { id: $id }) {
            ... on ProcurementType {
                title
            }
            ... on OperationInfo {
                __typename
                messages {
                    message
                }
            }
        }
    }
`;
