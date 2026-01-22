/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const RESOURCES_QUERY = gql`
    query Resource($pagination: OffsetPaginationInput) {
        resources(pagination: $pagination) {
            pageInfo {
                limit
                offset
            }
            totalCount
            results {
                type
                title
                id
                directive {
                    id
                    title
                }
                publishedDate
            }
        }
    }
`;

const RESOURCES_DETAIL_QUERY = gql`
    query ResourceDetail($id: ID!) {
        resource(id: $id) {
            content
            coverImage {
                name
                size
                url
            }
            createdBy {
                id
                firstName
                lastName
            }
            directiveId
            id
            type
            title
            slug
            publishedDate
            modifiedBy {
                id
                firstName
                lastName
            }
            file {
                name
                size
                url
            }
        }
    }
`;

const CREATE_RESOURCES_MUTATION = gql`
    mutation CreateResource($data: ResourceCreateInput!) {
        createResource(data: $data) {
            ... on ResourceTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const UPDATE_RESOURCES_MUTATION = gql`
    mutation UpdateResource($pk: ID!, $data: ResourceUpdateInput!) {
        updateResource(pk: $pk, data: $data) {
            ... on ResourceTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const DELETE_RESOURCES = gql`
    mutation DeleteResource($id: ID!) {
        deleteResource(data: { id: $id }) {
            ... on ResourceType {
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
