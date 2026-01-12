/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const HIGHLIGHT_QUERY = gql`
    query Highlight($pagination: OffsetPaginationInput) {
        highlights(pagination: $pagination) {
            pageInfo {
                limit
                offset
            }
            totalCount
            results {
                actionLinks {
                    id
                    label
                    url
                }
                createdBy {
                    firstName
                    lastName
                }
                description
                heading
                id
                isActive
                image {
                    name
                    url
                    size
                }
            }
        }
    }
`;

const HIGHLIGHT_DETAIL = gql`
    query HighlightDetail($id: ID!) {
        highlight(id: $id) {
            actionLinks {
                id
                label
                url
            }
            createdBy {
                firstName
                lastName
            }
            description
            heading
            id
            image {
                name
                url
                size
            }
            isActive
            modifiedBy {
                firstName
                lastName
            }
        }
    }
`;

const CREATE_HIGHLIGHT_MUTATION = gql`
    mutation CreateHighlight($data: HighlightCreateInput!) {
        createHighlight(data: $data) {
            ... on HighlightTypeMutationResponseType {
                __typename
                errors
                ok
            }
        }
    }
`;

const UPDATE_HIGHLIGHT_MUTATION = gql`
    mutation UpdateHighlight($pk: ID!, $data: HighlightUpdateInput!) {
        updateHighlight(pk: $pk, data: $data) {
            ... on HighlightTypeMutationResponseType {
                __typename
                errors
                ok
            }
        }
    }
`;

const DELETE_HIGHLIGHT = gql`
    mutation DeleteHighlight($id: ID!) {
        deleteHighlight(data: { id: $id }) {
            ... on OperationInfo {
                __typename
                messages {
                    message
                }
            }
            ... on HighlightType {
                id
            }
        }
    }
`;
