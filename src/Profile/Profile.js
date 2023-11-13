import React from "react"
import './Profile.css'

const UserProfile = ({name, profileImage, bgImage, }) => {
    return (
        <div className="user-profile">
            <img src={profileImage} alt={name} />
            <p>{name}</p>
        </div>
    );
};

const defaultImage = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'

const renderFriendProfiles = () => {
    const friendProfiles = [
      { name: '지인 1', profileImage: defaultImage },
      { name: '지인 2', profileImage: defaultImage },
      { name: '지인 3', profileImage: defaultImage },
      { name: '지인 4', profileImage: defaultImage },
      { name: '지인 5', profileImage: defaultImage },
      { name: '지인 6', profileImage: defaultImage },
    ];
  
    return friendProfiles.slice(0, 3).map((profile, index) => (
      <UserProfile
        key={'friend-' + index}
        name={profile.name}
        profileImage={profile.profileImage}
      />
    ));
  };
  
  const renderRecommendProfiles = () => {
    const recommendProfiles = [
      { name: '지인 1', profileImage: defaultImage },
      { name: '지인 2', profileImage: defaultImage },
      { name: '지인 3', profileImage: defaultImage },
      { name: '지인 4', profileImage: defaultImage },
      { name: '지인 5', profileImage: defaultImage },
      { name: '지인 6', profileImage: defaultImage },
    ];
  
    return recommendProfiles.slice(0, 3).map((profile, index) => (
      <UserProfile
        key={'recommend-' + index}
        name={profile.name}
        profileImage={profile.profileImage}
      />
    ));
  };

  export const Profile = () => {
    return (
      <div className="body">
        <div className="friend-profiles">
          <h2>지인들의 프로필을 구경해보세요!</h2>
          <div className="profiles-row">
            {renderFriendProfiles()}
          </div>
        </div>
        <div className="friend-profiles">
          <h2>더 많은 친구를 찾아보세요!</h2>
          <div className="profiles-row">
            {renderRecommendProfiles()}
          </div>
        </div>
      </div>
    );
  };