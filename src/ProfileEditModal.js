//Modal.js

import React, { useState, useRef } from "react";
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './ProfileEditModal.css'
import './ProfileDetail.css';

// How to add button?

/* // Profile Edit
    const [profileEditClicked, setProfileEditClicked] = useState(false);
    const profileEditClick = () => {
      setProfileEditClicked(true);
    };
    const profileEditModalClose = () => {
      setProfileEditClicked(false);
    };
  <div className="edit-profile">
    <input type="button" class="profile-edit-button" onClick={profileEditClick}>
    </input>
    {profileEditClicked && (
      <ProfileEditModal
        user={null}
        profileEditModalClose={profileEditModalClose}
      />
    )}
  </div> */

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

const ProfileEditModal = ({EditModalClose}) => {
    const closeClick = () => {
        EditModalClose?.(); // profileEditModalClose을 실행!
    };

    // Profile 사진 
    const [Image, setImage] = useState("https://images.pexels.com/photos/1804796/pexels-photo-1804796.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260");
    const fileInput = useRef(null);

    const onChange = (e) => {
      if (e.target.files[0]){
        setImage(e.target.files[0])
      }
      // 업로드 취소할 시
      else {
        return
      }

      //화면에 프로필 사진 표시
      const reader = new FileReader();
      reader.onload = () => {
          if(reader.readyState === 2){
              setImage(reader.result)
          }
      }
      reader.readAsDataURL(e.target.files[0])
    }

    return (
        <div class="edit-overlay">
          <div class="edit-modal-wrap">
            <h1>프로필</h1>
            <hr style={{border: "solid 1px black"}}/>
            <div class="edit-profile-image">
              <h3>프로필 사진</h3>
              <div class="image-edit-button-wrapper">
                <label for="file-search">
                  <img class="profile-image" src={Image}  alt="Profile Photo"/>
                  <div class="image-edit-button">✏️ 변경하기</div>
                </label>
                
                <input id="file-search" type='file' 
                    style={{display: "none",
                            cursor: "pointer"}}
                    accept='image/jpg, image/png, image/jpeg' 
                    name='profile_img'
                    onChange={onChange}
                    ref={fileInput}/>
              </div>
            </div>
            <div class="edit-contents">
              <h3>닉네임</h3>
                <input type="text" class="edit-section" placeholder="이선생"></input> 
              <h3>개인 웹사이트</h3>
                <input type="button" class="edit-link-icon"></input>
                <input type="url" class="edit-section" placeholder="개인 웹사이트 URL"></input>
              <h3>SNS</h3>
                <input type = "button" class="edit-link-icon"></input>
                <input type="url" class="edit-section" placeholder="SNS URL"></input><br></br>
                <input type = "button" class="edit-link-icon"></input>
                <input type="url" class="edit-section" placeholder="SNS URL"></input>
              <div>
              <h3>연락처</h3>
                <input type="text" class="edit-section" placeholder="전화번호"></input><br></br>
                <input type="text" class="edit-section" placeholder="이메일 주소"></input>
              </div>
              
              <span class="edit-back-button" onClick={closeClick}>돌아가기</span> <span class="edit-save-button" onClick={closeClick}>저장하기</span> 
            </div>
          </div>
        </div>
    );
};

const ProfileIntroEditModal = ({EditModalClose}) => {
  const closeClick = () => {
      EditModalClose?.(); // profileEditModalClose을 실행!
  };

  // Profile 사진 
  const [Image, setImage] = useState("https://images.pexels.com/photos/1804796/pexels-photo-1804796.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260");
  const fileInput = useRef(null);

  const onChange = (e) => {
    if (e.target.files[0]){
      setImage(e.target.files[0])
    }
    // 업로드 취소할 시
    else {
      return
    }

    //화면에 프로필 사진 표시
    const reader = new FileReader();
    reader.onload = () => {
        if(reader.readyState === 2){
            setImage(reader.result)
        }
    }
    reader.readAsDataURL(e.target.files[0])
  }
  
  function onTestChange() {
    var key = window.event.keyCode;

    // If the user has pressed enter
    if (key === 13) {
        document.getElementById("txtArea").value = document.getElementById("txtArea").value + "\n*";
        return false;
    }
    else {
        return true;
    }
  }

  return (
      <div class="edit-overlay">
        <div class="edit-modal-wrap">
          <h1>🚀 비행사 소개</h1>
          <hr style={{border: "solid 1px black"}}/>
          <div class="edit-contents">
            <h4>본인을 한 줄로 소개해주세요!</h4>
              <input type="text" class="intro-edit-section" placeholder="안녕하세요. 재미있는 일이라면 무엇이든 함께해요, 이선생입니다."></input> 
            <div class="edit-profile-intro-image">
              <h4>멋진 모습을 보여주세요!</h4>
              <label for="file-search">
                <img class="profile-intro-image" src={Image}  alt="Profile Photo"/>
                <div class="image-edit-button">✏️ 변경하기</div>
              </label>
              <input id="file-search" type='file' 
                  style={{display: "none",
                          cursor: "pointer"}}
                  accept='image/jpg, image/png, image/jpeg' 
                  name='profile_img'
                  onChange={onChange}
                  ref={fileInput}/>
            </div>
            <h4 style={{margin: "2px"}}>본인을 자유롭게 표현해주세요!</h4>
              <textarea class="intro-detail-edit-section" placeholder=""/>
          </div>
          <span class="edit-back-button" onClick={closeClick}>돌아가기</span> <span class="edit-save-button" onClick={closeClick}>저장하기</span> 
        </div>
      </div>
  );
};

const ProfileCareerEditModal = ({EditModalClose}) => {
  const closeClick = () => {
      EditModalClose?.(); // profileEditModalClose을 실행!
  };

  const [AddClicked, setAddClicked] = useState(false);
  const AddClick = () => {
    setAddClicked(true);
  };
  const AddModalClose = () => {
    setAddClicked(false);
  };

  return (
      <div class="edit-overlay">
          <div class="edit-modal-wrap">
          <div class="edit-add-button" onClick={AddClick}>
            <FontAwesomeIcon icon={faPlus} style={{color: "#000000",}} />
            {AddClicked && (
              <ProfileEditModal
                user={null}
                EditModalClose={EditModalClose}
              />
            )}
          </div>
          <div class="edit-contents">
            <span className="career-body">
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
            </span>
            <span class="edit-back-button" onClick={closeClick}>돌아가기</span> <span class="edit-save-button" onClick={closeClick}>저장하기</span> 
          </div>
          </div>
      </div>
  );
};


export {ProfileEditModal, ProfileIntroEditModal, ProfileCareerEditModal};
