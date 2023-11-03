import React, { useRef, useState } from 'react';
import { FaFacebookSquare, FaInstagramSquare} from 'react-icons/fa';
import { MdPhoneIphone, MdEmail, MdCalendarMonth } from 'react-icons/md'
import './ProfileDetail.css';

const profileData = {
  nickname: '홍길동',
  followers: 500,
  following: 300,
  profile_image: 'https://images.pexels.com/photos/1804796/pexels-photo-1804796.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  intro_image: 'https://cdn.imweb.me/upload/S20191010288d21675b22f/e33c22faf15bc.jpg',
  intro_title: '링크 혹은 이미지 경로',
  intro_content: `언제나 저를 이끈 건 ‘재미’입니다.\n늘 재미있는 일을 찾아다니죠.\n지금 저에게 가장 재미있는 일은 그림과 글쓰기, 그리고 영화랍니다.\n
  삶의 다양한 선택에서 늘 저를 이끌었던 건 ‘재미’였습니다.
제가 재미있는 일을 하며 먹고살 수 있다면, 그것이 바로 행복이 아닐까 싶습니다. 단순히, 즐거운 기분을 넘어서 좋은 성과와 보람이 가득한 재미를 느껴 보고 싶습니다.
이번 프로젝트는 제가 좋아하는 영화와 그림, 글을 통해 재미있어 보려고 했습니다.`,
  intro_keyword: ['글쓰기', '영화', '여행가'],
  career: {
    '교육공학자': ['교육공학 박사',
                  '교육 콘텐츠 개발 및 기획',
                  '수업 컨설턴트, 학습 컨설턴트 자격 보유'],
    '일러스트레이터': ['동화 [나뭇잎 날개] 삽화 및 표지 작업 (출간 예정)',
                    '도서 [어른이 되어 다시 만나는 철학] 삽화 및 표지 작업'],
    '작가': ['시네마에듀(가제) 출판 계약 및 출간 예정(2023년 8월)']
  },
  calendar_id: 1,
  background_image: 'https://images.pexels.com/photos/1731427/pexels-photo-1731427.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  contact_facebook: 'kakao.brandmedia',
  contact_insta: 'kakao.today',
  contact_email: 'user@example.com',
  contact_phone: '010-1234-5678',
  company_id: 13
};

const ProfileHeader = () => {
    const bgImageStyle = {
        backgroundImage: `url(${profileData.background_image})`
      };
    const facebook_url = 'https://www.facebook.com/' + profileData.contact_facebook;
    const insta_url = 'https://www.instagram.com/' + profileData.contact_insta

  return (
    <div className="header-container">
        <div className="bg-image" style={bgImageStyle}>
        </div>
      <main>
        <div className="profile-header">
            <div className="header-left">
                <div className="header-left1">
                    <span className="nickname">{profileData.nickname}</span>
                    <span className="info">니트컴퍼니 {profileData.company_id}기</span>
                </div>
                <div className="header-left2">
                    <span className="info">팔로워 {profileData.followers}명</span>
                    <span className="info">팔로잉 {profileData.following}명</span>
                </div>
                <div className="header-left3">
                    <button>Follow</button>
                </div>
            </div>
            <div className="header-mid">
                <img className="profile-image" src={profileData.profile_image} alt="Profile Photo"/>
            </div>
            <div className="header-right">
                <div className="header-right1">
                    <a href={facebook_url} target="_blank" rel="noopener noreferrer">
                        <FaFacebookSquare size="30"/>
                    </a>
                    <a href={insta_url} target="_blank" rel="noopener noreferrer">
                        <FaInstagramSquare size="30"/>
                    </a>
                </div>
                <div className="header-right2">
                    <div className="phone-number">
                        <MdPhoneIphone size="16"/>&nbsp;
                        {profileData.contact_phone}
                    </div>
                    <div className="email">
                        <MdEmail size="16"/>&nbsp;
                        {profileData.contact_email}
                    </div>
                    <div className="calendar">
                        <MdCalendarMonth size="16"/>&nbsp;
                        비행일정 확인하기
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

const ProfileIntro = () => {

  return (
    <div className="container">
      <main>
        <h2>나를 <span className="highlight">소개</span>합니다</h2>
        <div className="body1">
            <img className="intro-image" src={profileData.intro_image}></img>
            <div className="intro">
              <div className="intro-content">
                {profileData.intro_content}
              </div>
              <div className="intro-keywords">
                  {profileData.intro_keyword.map((keyword, index) => (
                      <span key={index} className="keyword">{`#${keyword}`}</span>
                  ))}
              </div>
            </div>
        </div>
      </main>
    </div>
  );
};

const ProfileCareer = () => {

return (
  <div className="container">
    <main>
      <h2>나는 이런 <span className="highlight">경험</span>을 했어요</h2>
      <div className="career-body">
        {Object.keys(profileData.career).map((job, index) => (
          <div className="career" key={index}>
            <div className="career-title">{job}</div>
            <div className="career-content">
              {profileData.career[job].map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  </div>
);
};

const ProfilePost = () => {
  // example posts
  const posts = [
    { id: 1, content: 'Post 1' },
    { id: 2, content: 'Post 2' },
    { id: 3, content: 'Post 3' },
    { id: 4, content: 'Post 4' },
    { id: 5, content: 'Post 5' },
    { id: 6, content: 'Post 6' },
    { id: 7, content: 'Post 7' },
    { id: 8, content: 'Post 8' },
    { id: 9, content: 'Post 9' }
  ];
  const firstThreePosts = posts.slice(0, 3);

  return (
    <div className="container">
      <main>
        <h2>게시글</h2>
        <div className="post">
          {firstThreePosts.map(post => (
            <span key={post.id}>{post.content}</span>
        ))}
        </div>
      </main>
    </div>
  );
};

const ProfileComment = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userProfile, setUserProfile] = useState('https://via.placeholder.com/50'); // 사용자 프로필 이미지 URL

  const handleInputChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (newMessage.trim() !== '') {
      const currentTime = new Date().toLocaleString();
      const message = { text: newMessage, user: '사용자 이름', time: currentTime };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="container">
      <main>
      <h2>방명록</h2>
      <div className='comment'>
        <img src={userProfile} alt="프로필"/>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="방명록을 남겨주세요!"
          />
          <button type="submit">전송</button>
        </form>
      </div>
      <div>
        {messages.map((message, index) => (
          <div key={index}>
            <div>{message.user} - {message.time} - {message.text}</div>
          </div>
        ))}
      </div>
      </main>
    </div>
  );
};

const ProfileDetail = () => {
  const introRef = useRef(null);
  const careerRef = useRef(null);
  const postRef = useRef(null);
  const commentRef = useRef(null);

  const scrollToRef = (ref) => {
      if (ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth' });
      }
  };
    return (
    <div style={{overflowY: 'auto' }}>
        <div>{ProfileHeader()}</div>
        <div className="buttons">
          <span onClick={() => scrollToRef(introRef)}>소개</span>
          <span onClick={() => scrollToRef(careerRef)}>경험</span>
          <span onClick={() => scrollToRef(postRef)}>게시글</span>
          <span onClick={() => scrollToRef(commentRef)}>방명록</span>
        </div>
        <div ref={introRef}>{ProfileIntro()}</div>
        <div ref={careerRef}>{ProfileCareer()}</div>
        <div ref={postRef}>{ProfilePost()}</div>
        <div ref={commentRef}>{ProfileComment()}</div>
    </div>
    )
}

export default ProfileDetail;
