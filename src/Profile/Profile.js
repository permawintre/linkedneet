import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { dbService, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { defaultData } from './defaultData'
import './Profile.css'

const tempFriendList = [
  'fqHAh2MftcVReUYWAwVZLkDCSbH2',
  'TXP0lyGl2dQ9oj74PLX6PfVDu3y2',
  '4Zpw6VfUknNgwo9QPZ9hvc7ZXJE3',
  'sBrmGtAJgtZB1xHzF0bgtImAVNa2',
  'jBFK5qORLBVnorvbvShyCdOQ4kp2',
  'uk5FJzl6mRVg3mnoRBxsJMvKyZs1',
];

// UserProfile 컴포넌트는 각 사용자의 ID를 받아 해당 사용자의 데이터를 Firebase에서 가져옴.
const UserProfile = ({ uid }) => {
  const [profileData, setProfileData] = useState(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from Firebase
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(dbService, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setProfileData(prevData => ({ ...prevData, ...userDoc.data() }));
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
  

  // firebase에서 data fetch되기 전까지 Loading... 띄우기
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-profile">
        <Link to={`/profiledetail?uid=${uid}`}>
          <img className="background-img" src={profileData.background_image}/>
          <img className="profile-img" src={profileData.profile_image} alt={profileData.nickname} />
        </Link>
        <div className="profile-info">
          <Link to={`/profiledetail?uid=${uid}`} className="profile-name">{profileData.nickname}</Link>
          <p className="profile-group">니트컴퍼니 {profileData.generation}기</p>
          <p className="profile-friend">{profileData.friendInfo}</p>
        </div>
    </div>
  );
};

const renderFollowerProfiles = (followerList) => {  
  // 유효한 userId만 필터링
  const validFollowers = followerList.filter(uid => uid);
  const slicedFollowers = validFollowers.slice(0, 4)

  if (validFollowers.length === 0) {
    return (
      <h1 className="profiles-row-center">아직 팔로워가 없어요... T^T</h1>
    )
  }

  return  (
    <div className="profiles-row">
      { validFollowers.map((uid, index) => (
        <UserProfile key={uid} uid={uid} />
      )) }
    </div>
  )
};

const renderFollowingProfiles = (followingList) => {
  // 유효한 userId만 필터링
  const validFollowings = followingList.filter(uid => uid);

  if (validFollowings.length === 0) {
    return (<h1 className="profiles-row-center">새로운 팔로잉을 추가해보세요!</h1>)
  }

  const slicedFollowings = validFollowings.slice(0, 4)  
  return (
    <div className="profiles-row">
      { validFollowings.map((uid, index) => (
        <UserProfile key={uid} uid={uid} />
      )) }
    </div>
  )
};

const renderRecommendProfiles = (recommendList) => {
  // 유효한 userId만 필터링
  const validRecommends = recommendList.filter(uid => uid);

  const slicedFollowings = validRecommends.slice(0, 4) 
  return (
    <div className="profiles-row">
      { validRecommends.map((uid, index) => (
        <UserProfile key={uid} uid={uid} />
      )) }
    </div>
  )
};

export const Profile = () => {
  // profiledetail에 접속해 있는 user의 정보(currentUserData)를 firebase에서 fetch
  const [currentUserData, setCurrentUserData] = useState({ ...defaultData });
  const [currentUserDataLoaded, setCurrentUserDataLoaded] = useState(false);

  useEffect( () => {
    const fetchCurrentUserData = async () => {
      try {
        const currentUserDocRef = doc(dbService, 'users', auth.currentUser.uid);
        const currentUserDoc = await getDoc(currentUserDocRef);

        if (currentUserDoc.exists()) {
          setCurrentUserData(prevData => ({ ...prevData, ...currentUserDoc.data() }));
        } else {
          console.log('User not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setCurrentUserDataLoaded(true);
      }
    };

    fetchCurrentUserData()
  }, []);

  // firebase에서 currentUserData가 fetch되기 전까지 Loading... 띄우기
  if (!currentUserDataLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="body">
      <div className="friend-profiles">
        <div className="friend-texts">
          <h2>팔로워 친구들의 프로필을 구경해보세요!</h2>
        </div>
        {renderFollowerProfiles(currentUserData.followers)}
      </div>
      <div className="friend-profiles">
        <div className="friend-texts">
          <h2>팔로잉 친구들의 프로필을 구경해보세요!</h2>
        </div>
        {renderFollowingProfiles(currentUserData.followings)}
      </div>
      <div className="friend-profiles-last">
        <div className="friend-texts">
          <h2>더 많은 친구를 찾아보세요!</h2>
        </div>
        {renderRecommendProfiles(tempFriendList)}
      </div>
    </div>
  );
};