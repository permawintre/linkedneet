import React, { useState, useEffect } from "react"
import style from './EnrollManage.module.css'
import { FcAlarmClock, FcCalendar, FcCheckmark, FcGlobe } from "react-icons/fc";
import { doc, getDoc, addDoc, collection, updateDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { auth, dbService, storage } from '../firebase.js'
import moment from 'moment'
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

function formatDateKR(timestamp) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
const dateFormatChange = (timestamp) => {
  if (timestamp instanceof Timestamp) {
    return new Date(timestamp.seconds * 1000);
  }
  return timestamp;
};

const ApplySection = ({ applicants, handleApprove, handleReject }) => {
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    // 전체 선택 또는 해제가 변경될 때마다 모든 지원자를 선택 또는 해제합니다.
    if (selectAll) {
      setSelectedApplicants(applicants.map((applicant) => applicant.id));
    } else {
      setSelectedApplicants([]);
    }
  }, [selectAll, applicants]);

  const handleCheckboxChange = (applicantId) => {
    const isSelected = selectedApplicants.includes(applicantId);
    if (isSelected) {
      setSelectedApplicants((prevSelected) =>
        prevSelected.filter((id) => id !== applicantId)
      );
    } else {
      setSelectedApplicants((prevSelected) => [...prevSelected, applicantId]);
    }
  };

  const handleBulkAction = async (action) => {
    try {
      // Create an array of promises for each applicant action
      const actionPromises = selectedApplicants.map((applicantId) => {
        if (action === 'approve') {
          return handleApprove(applicantId);
        } else if (action === 'reject') {
          return handleReject(applicantId);
        }
        return null;
      });

      // Wait for all promises to complete
      await Promise.all(actionPromises);

      setSelectedApplicants([]);
      setSelectAll(false); // 전체 선택 상태 초기화
      window.alert('처리되었습니다');
      window.location.reload();
    } catch (error) {
      console.error('처리 중 오류 발생:', error);
    }
  };

  return (
    <div className={`${style.projectDetail} ${style.projectBody}`}>
      <div className={style.bulkActionButton}>
        <button onClick={() => handleBulkAction('approve')}>승인하기</button>
        <button onClick={() => handleBulkAction('reject')}>거절하기</button>
      </div>
      <div className={style.selectAll} onClick={() => setSelectAll(!selectAll)}>
        {selectAll ? '✔️ 전체해제' : '✔️ 전체선택'}
      </div>
      <div className={style.bodyBox}>
        {applicants.map((applicant) => (
          <div className={style.applicantBox} key={applicant.id}>
            <div className={style.applicantButton}>
              <input
                type="checkbox"
                checked={selectedApplicants.includes(applicant.id)}
                onChange={() => handleCheckboxChange(applicant.id)}
              />
              선택하기
            </div>
            <div className={style.userInfo}>
              <div className={style.applicantName}>{applicant.name? applicant.name : '이름없음'}</div>
              <div className={style.applicantNickname}>{applicant.nickname}</div>              <div className={style.applicantEmail}>{applicant.email}</div>
              <div className={style.applicantGeneration}>{applicant.generation}기</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MemberSection = ({ members }) => {
  const [activeGeneration, setActiveGeneration] = useState(null);

  // Extract unique generation values and sort them in descending order
  const uniqueGenerations = [...new Set(members.map((member) => member.generation))].sort(
    (a, b) => b - a
  );

  const handleGenerationClick = (generation) => {
    setActiveGeneration(generation);
  };

  const handleShowAll = () => {
    setActiveGeneration(null); // Set activeGeneration to null to show all members
  };

  return (
    <div className={`${style.projectDetail} ${style.projectBody}`}>
      <div className={style.bodyBox}>
        <div className={style.generationButtons}>
          <button onClick={handleShowAll} className={!activeGeneration ? style.activeButton : ''}>
            전체 멤버
          </button>
          {uniqueGenerations.map((generation) => (
            <button
              key={generation}
              onClick={() => handleGenerationClick(generation)}
              className={activeGeneration === generation ? style.activeButton : ''}
            >
              {`${generation}기`}
            </button>
          ))}
        </div>

        <div className={style.generationBox}>
          {members
            .filter((member) => (activeGeneration ? member.generation === activeGeneration : true))
            .map((member) => (
              <div className={style.applicantBox} key={member.id}>
                <div className={style.userInfo}>
                  <div>
                    <div className={style.applicantName}>{member.name? member.name : '이름없음'}</div>
                    <div className={style.applicantNickname}>{member.nickname}</div>
                  </div>
                  <div>
                    <div className={style.applicantEmail}>⦁ email: {member.email}</div>
                    <div className={style.applicantPhone}>⦁ tel: {member.tel}</div>
                  </div>
                </div>
                {/* Add more member details as needed */}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export const EnrollManage = () => {
  const [applicants, setApplicants] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeSection, setActiveSection] = useState('applySection');

  const handleButtonClick = (elementId) => {
    setActiveSection(elementId);
  };

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const applyCollection = collection(dbService, 'users');
        const q = query(applyCollection, where('level', '==', 0));
        const querySnapshot = await getDocs(q);

        const applicantsData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setApplicants(applicantsData);
      } catch (error) {
        console.error('지원자를 불러오는 동안 오류 발생:', error);
      }
    };
    const fetchMembers = async () => {
      try {
        const applyCollection = collection(dbService, 'users');
        const q = query(applyCollection, where('level', '==', 1));
        const querySnapshot = await getDocs(q);

        const applicantsData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setMembers(applicantsData);
      } catch (error) {
        console.error('회원을 불러오는 동안 오류 발생:', error);
      }
    };
    fetchApplicants();
    fetchMembers();
  }, []);

  const handleApprove = async (applicantId) => {
    try {
      // Update the status to '승인후' in the projectApply collection
      await updateDoc(doc(dbService, 'users', applicantId), {
        level: 1,
      });
    } catch (error) {
      console.error('승인 처리 중 오류 발생:', error);
    }
  };

  const handleReject = async (applicantId) => {
    try {
      // Update the status to '거절' in the projectApply collection
      await deleteDoc(doc(dbService, 'users', applicantId));
      window.alert('거절되었습니다');
    } catch (error) {
      console.error('거절 처리 중 오류 발생:', error);
    }
  };

  return (
    <div className={style.body} style={{ overflowY: 'auto' }}>
      <div className={style.Buttons}>
        <span
          className={`${style.buttonItem} ${style[activeSection === 'applySection' ? 'active' : '']}`}
          onClick={() => handleButtonClick('applySection')}
        >
          <span className={style.text}>지원자 관리</span>
        </span>
        <span
          className={`${style.buttonItem} ${style[activeSection === 'memberSection' ? 'active' : '']}`}
          onClick={() => handleButtonClick('memberSection')}
        >
          <span className={style.text}>멤버 관리</span>
        </span>
      </div>
      <div id="memberSection">
        {activeSection === 'memberSection' && (
        <>
          {members.length === 0 ? (
            <div className={`${style.projectDetail} ${style.projectBody}`}>
              멤버가 없습니다
            </div>
          ) : (<MemberSection members={members}/>)}
        </>
        )}
      </div>
      <div id="applySection">
        {activeSection === 'applySection' && (
          <div>
            {applicants.length === 0 ? (
                <div className={`${style.projectDetail} ${style.projectBody}`}>
                지원자가 없습니다
                </div>
            ) : (
                <ApplySection
                applicants={applicants}
                handleApprove={handleApprove}
                handleReject={handleReject}
                />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
