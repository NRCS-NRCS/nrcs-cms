/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const NEWS_QUERY = gql`
    query News($pagination: OffsetPaginationInput, $filter: NewsFilter) {
        news(pagination: $pagination, filters: $filter) {
            pageInfo {
                limit
                offset
            }
            totalCount
            results {
                id
                publishedDate
                status
                title
                isHighlighted
                directive {
                    title
                }
            }
        }
    }
`;

const NEWS_DETAIL_QUERY = gql`
    query NewsDetail($id: ID!) {
        newsItem(id: $id) {
            content
            coverImage {
                name
                size
                url
            }
            createdBy {
                firstName
                lastName
            }
            directiveId
            file {
                name
                size
                url
            }
            id
            publishedDate
            slug
            status
            title
            isHighlighted
            actionLinks {
                id
                label
                url
            }
            modifiedBy {
                firstName
                lastName
            }
        }
    }
`;

const DIRECTIVE = gql`
    query Directive {
        strategicDirectives {
            results {
                id
                title
            }
        }
    }
`;

const CREATE_NEWS_MUTATION = gql`
    mutation CreateNews($data: NewsCreateInput!) {
        createNews(data: $data) {
            ... on NewsTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const UPDATE_NEWS_MUTATION = gql`
    mutation UpdateNews($pk: ID!, $data: NewsUpdateInput!) {
        updateNews(pk: $pk, data: $data) {
            ... on NewsTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const DELETE_NEWS = gql`
    mutation DeleteNews($id: ID!) {
        deleteNews(data: { id: $id }) {
            ... on NewsType {
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
