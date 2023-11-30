import React, { useState, useEffect } from "react"
import style from './Manage.module.css'
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
  console.log(applicants);
  const [selectedApplicants, setSelectedApplicants] = useState([]);

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
      window.alert('처리되었습니다');
      window.location.reload();
    } catch (error) {
      console.error('처리 중 오류 발생:', error);
    }
  };

  return (
    <div className={`${style.projectDetail} ${style.projectBody}`}>
      <div className={style.bodyTitle}>지원자 목록</div>
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
            <div className={style.applicantName}>{applicant.nickname}</div>
            <div className={style.applicantEmail}>{applicant.email}</div>
            <div className={style.applicantEmail}>{applicant.generation}기</div>
          </div>
          {/* <div className={style.formItem}>
            <div className={style.formTitle}>▶ 지원 동기</div>
            <div className={style.formAnswer}>{applicant.applyReason}</div>
          </div> */}
        </div>))}
      </div>
      <div className={style.bulkActionButton}>
        <button onClick={() => handleBulkAction('approve')}>승인하기</button>
        <button onClick={() => handleBulkAction('reject')}>거절하기</button>
      </div>
    </div>
  );
};


export const EnrollManage = () => {
  const [applicants, setApplicants] = useState([]);

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
    fetchApplicants();
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
      <div id="applySection">
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
    </div>
  );
};
