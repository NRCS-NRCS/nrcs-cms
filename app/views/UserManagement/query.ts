/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const USER_QUERY = gql`
    query Users($pagination: OffsetPaginationInput) {
        users(pagination: $pagination) {
            pageInfo {
                limit
                offset
            }
            totalCount
            results {
                lastName
                firstName
                id
            }
        }
    }
`;
