import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { dbService, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { defaultData } from './defaultData'
import './Profile.css'

const tempFriendList = [
  { userId: '4Zpw6VfUknNgwo9QPZ9hvc7ZXJE3' },
  { userId: 'fqHAh2MftcVReUYWAwVZLkDCSbH2' },
  { userId: 'TXP0lyGl2dQ9oj74PLX6PfVDu3y2' },
  { userId: 'jBFK5qORLBVnorvbvShyCdOQ4kp2' },
  { userId: 'uk5FJzl6mRVg3mnoRBxsJMvKyZs1' },
  { userId: 'sBrmGtAJgtZB1xHzF0bgtImAVNa2' },
];

// UserProfile 컴포넌트는 각 사용자의 ID를 받아 해당 사용자의 데이터를 Firebase에서 가져옴.
const UserProfile = ({ userId }) => {
  const [profileData, setProfileData] = useState(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from Firebase
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(dbService, 'users', userId);
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
  }, [userId]);
  

  // firebase에서 data fetch되기 전까지 Loading... 띄우기
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-profile">
        <Link to={`/profiledetail?uid=${userId}`}>
          <img className="background-img" src={profileData.background_image}/>
          <img className="profile-img" src={profileData.profile_image} alt={profileData.nickname} />
        </Link>
        <div className="profile-info">
          <Link to={`/profiledetail?uid=${userId}`} className="profile-name">{profileData.nickname}</Link>
          <p className="profile-group">니트컴퍼니 {profileData.generation}기</p>
          <p className="profile-friend">{profileData.friendInfo}</p>
        </div>
    </div>
  );
};

const renderFollowerProfiles = (followerList) => {  
  return followerList.slice(0, 2).map((friend, index) => (
    <UserProfile key={friend.userId} userId = {friend.userId}/>
  ));
};

const renderFollowingProfiles = (followingList) => {
  return followingList.slice(2, 4).map((friend, index) => (
    <UserProfile key={friend.userId} userId = {friend.userId}/>
  ));
};

const renderRecommendProfiles = (recommendList) => {
  return recommendList.slice(4, 6).map((friend, index) => (
    <UserProfile key={friend.userId} userId = {friend.userId}/>
  ));
};

export const Profile = () => {
  return (
    <div className="body">
      <div className="friend-profiles">
        <div className="friend-texts">
          <h2>팔로워 친구들의 프로필을 구경해보세요!</h2>
        </div>
        <div className="profiles-row">
          {renderFollowerProfiles(tempFriendList)}
        </div>
      </div>
      <div className="friend-profiles">
        <div className="friend-texts">
          <h2>팔로잉 친구들의 프로필을 구경해보세요!</h2>
        </div>
        <div className="profiles-row">
          {renderFollowingProfiles(tempFriendList)}
        </div>
      </div>
      <div className="friend-profiles">
        <div className="friend-texts">
          <h2>더 많은 친구를 찾아보세요!</h2>
        </div>
        <div className="profiles-row">
          {renderRecommendProfiles(tempFriendList)}
        </div>
      </div>
    </div>
  );
};