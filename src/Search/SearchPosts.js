import React from "react"
import algoliasearch from "algoliasearch/lite";
import { InstantSearch, useHits , Configure} from 'react-instantsearch-hooks-web';
import { Post } from '../Home/Home'

const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_ID,
  process.env.REACT_APP_ALGOLIA_SEARCH_KEY
);

export const SearchPosts = ({ searchterm, currentUserData }) => {

    const HitsComponent = () => {
        const { hits } = useHits();

        if (hits.length === 0) {
            return <h1 className="profiles-row-center">포스트 검색 결과가 없어요... T^T</h1>;
        }
        return (
          <div className="search-post-list">
            {hits.map(hit => (
                <div key={hit.postId}>
                    <Post 
                        contents = {hit.contents}
                        postedAt = {new Date(hit.postedAt*1000)}
                        imgUrls = {hit.imgUrls}
                        numOfLikes = {hit.numOfLikes}
                        numOfComments = {hit.numOfComments}
                        whoLikes = {hit.whoLikes}
                        postId = {hit.objectID}
                        userId= {hit.userId}
                        postWhere = {hit.postWhere}
                        userInfo={currentUserData}
                        modified = {hit.modified}
                        projectId = {hit.projectId}
                    />
                    <div className='postFooter'>
                    </div>
                </div>
            ))}
            <div className='postFooter'>
            </div>
          </div>
        );
      };

    return (
      <InstantSearch searchClient={searchClient} indexName="posts">
        <Configure query={searchterm} />
        <HitsComponent />
      </InstantSearch>
    );
};