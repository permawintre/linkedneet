import React, { useState, useEffect } from "react"
import style from './ProjectManage.module.css'
import { FcAlarmClock, FcCalendar, FcCheckmark, FcGlobe } from "react-icons/fc";
import { doc, getDoc, getFirestore, addDoc, collection, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { auth } from '../firebase.js'
import moment from 'moment'
import { useNavigate } from 'react-router-dom';

function formatDateKR(timestamp) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

const ProjectHeader = (project) => {
    const { projectId } = useParams();
    return (
        <div className={style.projectDetail}>
          <div className={style.projectBoxDetail}>
            <div className={style.projectBoxColumn}>
              <img src={project.image} alt={project.name} />
            </div>
            <div className={style.projectBoxColumn}>
              <div className={style.name}>{project.name}</div>
              <div className={style.comment}>
                <div>{project.shortDescription}</div>
              </div>
              <div className={style.info}>
                <div>
                  <FcAlarmClock />
                  <span className={style.infoTitle}>모집기간</span>
                  <span className={style.infoContent}>
                    {formatDateKR(project.recruitStartDate)} ~ {formatDateKR(project.recruitEndDate)}
                  </span>
                </div>
                <div>
                  <FcCalendar />
                  <span className={style.infoTitle}>운영기간</span>
                  <span className={style.infoContent}>
                    {formatDateKR(project.runningStartDate)} ~ {formatDateKR(project.runningEndDate)}
                  </span>
                </div>
                <div>
                  <FcCheckmark />
                  <span className={style.infoTitle}>분류</span>
                  <span className={style.infoContent}>{project.category}</span>
                </div>
                <div>
                  <FcGlobe />
                  <span className={style.infoTitle}>장소</span>
                  <span className={style.infoContent}>{project.type}</span>
                </div>
              </div>
              <div className={style.info}>
                <Link to={`/projectDetail/${projectId}`} style={{ color: 'gray' }}>
                    상세보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
}

const ApplySection = ({ project, applicants, handleApprove, handleReject }) => {
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

  const handleBulkAction = (action) => {
    selectedApplicants.forEach((applicantId) => {
      if (action === 'approve') {
        handleApprove(applicantId);
        window.alert('승인되었습니다');
        window.location.reload();
      } else if (action === 'reject') {
        handleReject(applicantId);
        window.alert('거절되었습니다');
        window.location.reload();
      }
    });
    setSelectedApplicants([]);
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
            <div className={style.applicantName}>{applicant.userNickname}</div>
            <div className={style.applicantEmail}>{applicant.userEmail}</div>
          </div>
          <div className={style.formItem}>
            <div className={style.formTitle}>▶ 지원 동기</div>
            <div className={style.formAnswer}>{applicant.applyReason}</div>
          </div>
          {project.recruitForm.map((form, index) => (
            <div key={index} className={style.formItem}>
              <div className={style.formTitle}>▶ {form}</div>
              <div className={style.formAnswer}>{applicant.applyForm[index]}</div>
            </div>
          ))}
        </div>))}
      </div>
      <div className={style.bulkActionButton}>
        <button onClick={() => handleBulkAction('approve')}>승인하기</button>
        <button onClick={() => handleBulkAction('reject')}>거절하기</button>
      </div>
    </div>
  );
};

const MemberSection = ({ members }) => {
  console.log(members)
  return (
    <div className={`${style.projectDetail} ${style.projectBody}`}>
      <div className={style.bodyTitle}>멤버 목록</div>
      <div className={style.bodyBox}>
        {members.map((member) => (
        <div className={style.applicantBox} key={member.id}>
          <div className={style.userInfo}>
            <div className={style.applicantName}>{member.userNickName}</div>
            <div className={style.applicantEmail}>{member.userEmail}</div>
          </div>
          <div className={style.formItem}>
            <div className={style.formTitle}>▶ 가입 일자</div>
            <div className={style.formAnswer}>{formatDateKR(member.createdAt)}</div>
          </div>
        </div>))}
      </div>
    </div>
  );
};

const EditSection = () => (
  <div className={`${style.projectDetail} ${style.projectBody}`}>
    edit
  </div>
);

export const ProjectManage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [members, setMembers] = useState([]);

  const [activeSection, setActiveSection] = useState('applySection');
  const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleButtonClick = (elementId) => {
    scrollToElement(elementId);
    setActiveSection(elementId);
  };

  const db = getFirestore();

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const applyCollection = collection(db, 'projectApply');
        const q = query(applyCollection, where('projectId', '==', projectId), where('status', '==', '승인전'));
        const querySnapshot = await getDocs(q);

        const applicantsData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setApplicants(applicantsData);
      } catch (error) {
        console.error('지원자를 불러오는 동안 오류 발생:', error);
      }
    };

    const fetchProject = async () => {
      try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));

        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          const updatedProjectData = { ...projectData, id: projectDoc.id };
          setProject(updatedProjectData);
          // Fetch applicants when the project is loaded
          fetchApplicants();
        } else {
          console.log('프로젝트를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('프로젝트를 가져오는 동안 오류 발생:', error);
      }
    };

    const fetchMembers = async () => {
      try {
        const applyCollection = collection(db, 'projectMember');
        const q = query(applyCollection, where('projectId', '==', projectId));
        const querySnapshot = await getDocs(q);

        const membersData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setMembers(membersData);
      } catch (error) {
        console.error('멤버를 불러오는 동안 오류 발생:', error);
      }
    };

    fetchProject();
    fetchApplicants();
    fetchMembers();
  }, [db, projectId]);

  const handleApprove = async (applicantId) => {
    try {
      // Update the status to '승인후' in the projectApply collection
      await updateDoc(doc(db, 'projectApply', applicantId), {
        status: '승인후',
      });

      // Add the user to the projectMember collection
      const selectedApplicant = applicants.find((applicant) => applicant.id === applicantId);
      await addDoc(collection(db, 'projectMember'), {
        projectId: project.id,
        userId: selectedApplicant.userId,
        userNickName: selectedApplicant.userNickname,
        userEmail: selectedApplicant.userEmail,
        createdAt: moment().toDate(),
      });
    } catch (error) {
      console.error('승인 처리 중 오류 발생:', error);
    }
  };

  const handleReject = async (applicantId) => {
    try {
      // Update the status to '거절' in the projectApply collection
      await updateDoc(doc(db, 'projectApply', applicantId), {
        status: '거절',
      });
      window.alert('거절되었습니다');
      
    } catch (error) {
      console.error('거절 처리 중 오류 발생:', error);
    }
  };


  if (!project) {
    return <p>Loading...</p>;
  }
  console.log("Applicants", applicants)
  console.log("Members", members)

  return (
    <div className={style.body} style={{ overflowY: 'auto' }}>
      <div className={style.titleBox}>
        <div className={style.joinTitle}>
          소모임 관리하기
        </div>
      </div>
      {ProjectHeader(project)}
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
        <span
          className={`${style.buttonItem} ${style[activeSection === 'editSection' ? 'active' : '']}`}
          onClick={() => handleButtonClick('editSection')}
        >
          <span className={style.text}>소모임 수정</span>
        </span>
      </div>
      <div id="applySection">
        {activeSection === 'applySection' && (
          <>
            {applicants.length === 0 ? (
              <div className={`${style.projectDetail} ${style.projectBody}`}>
                지원자가 없습니다
              </div>
            ) : (
              <ApplySection
                project={project}
                applicants={applicants}
                handleApprove={handleApprove}
                handleReject={handleReject}
              />
            )}
          </>
        )}
      </div>
      <div id="memberSection">
        {activeSection === 'memberSection' && <MemberSection members={members}/>}
      </div>
      <div id="editSection">
        {activeSection === 'editSection' && <EditSection />}
      </div>
    </div>
  );
};
