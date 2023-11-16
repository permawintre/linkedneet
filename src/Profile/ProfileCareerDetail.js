import React, { useState, useRef, useEffect } from "react";
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { dbService, auth } from '../firebase'
import { updateDoc, getDoc, doc } from "firebase/firestore"
import { Link, useNavigate } from "react-router-dom"
import { ProfileCareerEditModal, ProfileCareerAddModal } from './ProfileEditModal';
import './ProfileCareerDetail.css'


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

/* https://leego.tistory.com/entry/React-%ED%9A%A8%EC%9C%A8%EC%A0%81%EC%9C%BC%EB%A1%9C-%EB%AA%A8%EB%8B%AC-%EA%B4%80%EB%A6%AC%ED%95%98%EA%B8%B0 */

const ProfileCareerDetail = () => {
    const navigate = useNavigate(); //변수 할당시켜서 사용
    const onClickBtn = () => {
      navigate(-1); // 바로 이전 페이지로 이동, '/main' 등 직접 지정도 당연히 가능
    };


    // Profile Edit
    const [EditClicked, setEditClicked] = useState(false);
    const EditClick = () => {
      setEditClicked(true);
    };
    const EditModalClose = () => {
      setEditClicked(false);
    };

    // Profile Edit
    const [AddClicked, setAddClicked] = useState(false);
    
    const AddClick = () => {
      setAddClicked(true);
    };
    const AddModalClose = () => {
      setAddClicked(AddClicked => !AddClicked);
    };

    // <FontAwesomeIcon icon={faPlus} size="2xl" style={{color: "#000000",}} /> //
    return (
      <div class="detail-background">
        <div class="detail-container">
          <div class="detail-overlay">
            <div class="detail-wrap">
              <div class="detail-contents">
                <span class="detail-add-profile">
                  <input type="button" class="edit-add-button" onClick={AddClick}></input>
                  {AddClicked && (
                    <ProfileCareerAddModal
                      user={null}
                      AddModalClose={AddModalClose}
                    />
                  )}
                </span>
                <div class="back-to-profile-button" onClick={onClickBtn}>
                  <FontAwesomeIcon icon={faArrowLeft} size="2xl" style={{color: "#000000",}} />
                </div>
                <h2 style={{margin: "0px 0px 10px 0px"}}><span className="highlight">경력</span> 수정하기</h2>
                {Object.keys(profileData.career).map((job, index) => (
                  <div className="career-body">
                    <div className="career-index"/>
                    <div className="career-wrapper" key={index}>
                      <div className="career-title-">{job}</div>
                      <div className="career-content">
                        {profileData.career[job].map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </div>
                    </div>
                    <span className="edit-profile">
                      <input type="button" class="edit-button" onClick={EditClick}/>
                      {EditClicked && (
                        <ProfileCareerEditModal
                          user={null}
                          EditModalClose={EditModalClose}
                        />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default ProfileCareerDetail;