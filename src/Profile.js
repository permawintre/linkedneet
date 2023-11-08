import React from "react"
import { Link } from "react-router-dom"
import './Profile.css'

const UserProfile = ({name, profileImage, backgroundImage, groupInfo, friendInfo, bgImage, }) => {
    return (
        <div className="user-profile">
            <Link to="/profiledetail">
              <img className="background-img" src={backgroundImage}/>
              <img className="profile-img" src={profileImage} alt={name} />
            </Link>
            <div className="profile-info">
              <Link to="/profiledetail" className="profile-name">{name}</Link>
              <p className="profile-group">{groupInfo}</p>
              <p className="profile-friend">{friendInfo}</p>
            </div>
        </div>
    );
};

const defaultImage = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
const simpsonImage = 'https://www.freepnglogos.com/uploads/simpsons-png/cartoon-characters-simpsons-png-pack-31.png'
const simpsonImage2 = 'https://miro.medium.com/v2/resize:fit:807/1*uCk-IDvDtDjFgoCy0vLkPw.png'
const simpsonImage3 = 'https://i.pinimg.com/736x/a0/a0/0a/a0a00a6a65033ef27b86b599cc796e1d.jpg'
const simpsonImage4 = 'https://thumbnail.10x10.co.kr/webimage/image/add1/497/A004979805_01.jpg?cmd=thumb&w=400&h=400&fit=true&ws=false'

const defaultBackground = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=2475&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
const defaultGroup = "니트컴퍼니 14기";
const defaultFriend = "홍길동님 외 지인 2명이 알고 있음";

const renderFriendProfiles = () => {
    const friendProfiles = [
      { name: '지인 1', profileImage: simpsonImage , backgroundImage: defaultBackground, groupInfo: defaultGroup, friendInfo: defaultFriend },
      { name: '지인 2', profileImage: simpsonImage2 , backgroundImage: defaultBackground, groupInfo: defaultGroup, friendInfo: defaultFriend },
      { name: '지인 3', profileImage: simpsonImage3 , backgroundImage: defaultBackground, groupInfo: defaultGroup, friendInfo: defaultFriend },
      { name: '지인 4', profileImage: simpsonImage4 , backgroundImage: defaultBackground, groupInfo: defaultGroup, friendInfo: defaultFriend },
      { name: '지인 5', profileImage: defaultImage , backgroundImage: defaultBackground, groupInfo: defaultGroup, friendInfo: defaultFriend },
      { name: '지인 6', profileImage: defaultImage , backgroundImage: defaultBackground, groupInfo: defaultGroup, friendInfo: defaultFriend },
    ];
  
    return friendProfiles.slice(0, 2).map((profile, index) => (
      <UserProfile
        key={'friend-' + index}
        name={profile.name}
        profileImage={profile.profileImage}
        backgroundImage={profile.backgroundImage}
        groupInfo={profile.groupInfo}
        friendInfo={profile.friendInfo}
      />
    ));
  };
  
  const renderRecommendProfiles = () => {
    const recommendProfiles = [
      { name: '지인 1', profileImage: simpsonImage , backgroundImage: defaultBackground, groupInfo: defaultGroup, friendInfo: defaultFriend },
      { name: '지인 2', profileImage: simpsonImage2 , backgroundImage: defaultBackground, groupInfo: defaultGroup, friendInfo: defaultFriend },
      { name: '지인 3', profileImage: simpsonImage3 , backgroundImage: defaultBackground, groupInfo: defaultGroup, friendInfo: defaultFriend },
      { name: '지인 4', profileImage: simpsonImage4 , backgroundImage: defaultBackground, groupInfo: defaultGroup, friendInfo: defaultFriend },
      { name: '지인 5', profileImage: defaultImage , backgroundImage: defaultBackground, groupInfo: defaultGroup, friendInfo: defaultFriend },
      { name: '지인 6', profileImage: defaultImage , backgroundImage: defaultBackground, groupInfo: defaultGroup, friendInfo: defaultFriend },
    ];
  
    return recommendProfiles.slice(2, 4).map((profile, index) => (
      <UserProfile
        key={'recommend-' + index}
        name={profile.name}
        profileImage={profile.profileImage}
        backgroundImage={profile.backgroundImage}
        groupInfo={profile.groupInfo}
        friendInfo={profile.friendInfo}
      />
    ));
  };

  export const Profile = () => {
    return (
      <div className="body">
        <div className="friend-profiles">
          <div className="friend-texts">
            <h2>지인들의 프로필을 구경해보세요!</h2>
          </div>
          <div className="profiles-row">
            {renderFriendProfiles()}
          </div>
        </div>
        <div className="friend-profiles">
          <div className="friend-texts">
            <h2>더 많은 친구를 찾아보세요!</h2>
          </div>
          <div className="profiles-row">
            {renderRecommendProfiles()}
          </div>
        </div>
      </div>
    );
  };
