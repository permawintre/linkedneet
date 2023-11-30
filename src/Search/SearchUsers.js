import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { dbService } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { defaultData } from '../Profile/defaultData'
import algoliasearch from "algoliasearch/lite";
import { InstantSearch, useHits , Configure} from 'react-instantsearch-hooks-web';

const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_ID,
  process.env.REACT_APP_ALGOLIA_SEARCH_KEY
);

const UserProfile = ({ userData, currentUserData }) => {
  const [friendInfo, setFriendInfo] = useState('');

  useEffect(() => {
    if (userData && currentUserData) {
      calculateFriendInfo(userData.followers, currentUserData.followings);
    }
  }, [userData, currentUserData]);
  
  const calculateFriendInfo = (profileFollowers, currentUserFollowing) => {
    // 현재 사용자의 팔로잉 중 프로필의 팔로워에 포함된 사람들 찾기
    const mutualFollowers = profileFollowers.filter(followerId => currentUserFollowing.includes(followerId));
    
    // Firebase에서 각 mutualFollower의 닉네임 가져오기
    const fetchNames = async () => {
      const names = await Promise.all(
        mutualFollowers.slice(0, 2).map(async (followerId) => {
          const docRef = doc(dbService, "users", followerId);
          const docSnap = await getDoc(docRef);
          return docSnap.exists() ? docSnap.data().nickname : 'Unknown';
        })
      );

      // "홍길동님 외 3명이 팔로우합니다." 형태의 문자열 생성
      let infoText = '';
      if (names.length > 0) {
        infoText += names.join(', ') + '님';
        if (mutualFollowers.length > 2) {
          infoText += ` 외 ${mutualFollowers.length - 2}명이 팔로우합니다.`;
        } else {
          infoText += `이 팔로우합니다.`;
        }
      } else {
        infoText = ''
      }
      setFriendInfo(infoText);
    };

    fetchNames();
  };

  const intro_title = userData.intro_title;
  const profile_image = userData.profile_image || 'https://s3.amazonaws.com/37assets/svn/765-default-avatar.png';
  const background_image = userData.background_image || 'https://images.pexels.com/photos/1731427/pexels-photo-1731427.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260';

  return (
    <div className="user-profile">
        <Link to={`/profiledetail?uid=${userData.uid}`}>
          <img className="background-img" src={background_image}/>
          <img className="profile-img" src={profile_image} alt={userData.nickname} />
        </Link>
        <div className="profile-info">
          <Link to={`/profiledetail?uid=${userData.uid}`} className="profile-name">{userData.nickname}</Link>
          <p className="profile-group">니트컴퍼니 {userData.generation}기</p>
          <p className="profile-intro-title">{intro_title ? `"${intro_title}"` : ''}</p>
        <p className="profile-friend">{friendInfo || ''}</p> {/* friendInfo가 없을 경우 빈 문자열 */}
        </div>
    </div>
  );
};

export const SearchUsers = ({ searchterm, currentUserData }) => {

    const HitsComponent = () => {
        const { hits } = useHits();
        if (hits.length === 0) {
            return <h1 className="profiles-row-center">유저 검색 결과가 없어요... T^T</h1>;
        }
        
        return (
          <div className="profiles-row">
            {hits.map(hit => (
              <UserProfile key={hit.objectID} userData={hit} currentUserData={currentUserData} />
            ))}
          </div>
        );
      };

    return (
      <InstantSearch searchClient={searchClient} indexName="users">
        <Configure query={searchterm} />
        <HitsComponent />
      </InstantSearch>
    );
};