import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { dbService, auth } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { defaultData } from '../Profile/defaultData'
import algoliasearch from "algoliasearch/lite";
import { InstantSearch, SearchBox, useHits ,  Configure} from 'react-instantsearch-hooks-web';

const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_ID,
  process.env.REACT_APP_ALGOLIA_SEARCH_KEY
);

// import './Profile.css'

// UserProfile 컴포넌트는 각 사용자의 ID를 받아 해당 사용자의 데이터를 Firebase에서 가져옴.
const UserProfile = ({ uid, currentUserData }) => {
  const [profileData, setProfileData] = useState(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [friendInfo, setFriendInfo] = useState('');

  useEffect(() => {
    // Fetch user data from Firebase
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(dbService, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const fetchedProfileData = userDoc.data();
          setProfileData(prevData => ({ ...prevData, ...fetchedProfileData }));
          // 프로필 사용자의 데이터가 로드되면 friendInfo 계산
          calculateFriendInfo(fetchedProfileData.followers, currentUserData.followings);
        } else {
          console.log('User not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false); // Loading 끝
      }
    };

    fetchUserData();
  }, [uid]);
  
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

  // firebase에서 data fetch되기 전까지 Loading... 띄우기
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const intro_title = profileData.intro_title;

  return (
    <div className="user-profile">
        <Link to={`/profiledetail?uid=${uid}`}>
          <img className="background-img" src={profileData.background_image}/>
          <img className="profile-img" src={profileData.profile_image} alt={profileData.nickname} />
        </Link>
        <div className="profile-info">
          <Link to={`/profiledetail?uid=${uid}`} className="profile-name">{profileData.nickname}</Link>
          <p className="profile-group">니트컴퍼니 {profileData.generation}기</p>
          <p className="profile-intro-title">{intro_title ? `"${intro_title}"` : ''}</p>
        <p className="profile-friend">{friendInfo || ''}</p> {/* friendInfo가 없을 경우 빈 문자열 */}
        </div>
    </div>
  );
};

const renderUsers = (userList, currentUserData) => {  
  // 유효한 userId만 필터링
  const validUsers = userList.filter(uid => uid);
  const slicedFollowers = validUsers.slice(0, 4)

  if (validUsers.length === 0) {
    return (
      <h1 className="profiles-row-center">유저 검색 결과가 없어요... T^T</h1>
    )
  }

  return  (
    <div className="profiles-row">
      { validUsers.map((uid, index) => (
        <UserProfile key={uid} uid={uid} currentUserData={currentUserData} />
      )) }
    </div>
  )
};

export const SearchUsers = ({ searchterm, currentUserData }) => {
    const [userList, setUserList] = useState([]);

    useEffect(() => {
      // 검색 상태 초기화
      setUserList([]);
    }, [searchterm]);

    const HitsComponent = () => {
        const { hits } = useHits();

        if (hits.length === 0) {
            return <h1 className="profiles-row-center">유저 검색 결과가 없어요... T^T</h1>;
        }
        
        return (
          <div className="profiles-row">
            {hits.map(hit => (
              <UserProfile key={hit.objectID} uid={hit.objectID} currentUserData={currentUserData} />
            ))}
          </div>
        );
      };
    return (
      <InstantSearch searchClient={searchClient} indexName="users">
        {/* 검색어가 nickname 필드에 포함되어 있는 문서만 필터링 */}
        <Configure query={searchterm} />
        <HitsComponent />
      </InstantSearch>
    );
};