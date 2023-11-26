import React, { useState, useEffect } from "react"
import style from './ProjectJoin.module.css'
import { FcAlarmClock, FcCalendar, FcCheckmark, FcGlobe } from "react-icons/fc";
import { doc, getDoc, addDoc, collection, where, getDocs, query } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { auth, dbService } from '../firebase.js'
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
              <img src={project.image.imageUrl} alt={project.name} />
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

export const ProjectJoin = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [uid, setUid] = useState("");
    const [userDetails, setUserDetails] = useState(null);
    const [formData, setFormData] = useState({
      projectId: '',
      userId: '',
      userNickname: '',
      userEmail: '',
      applyReason: '',
      applyForm: '',
      status: '승인전'
    });
    const navigate = useNavigate();

    useEffect(() => {
      if (auth.currentUser) {
        setUid(auth.currentUser.uid);
      }
    }, []);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const projectDoc = await getDoc(doc(dbService, 'projects', projectId));
    
                if (projectDoc.exists()) {
                    const projectData = projectDoc.data();
                    setProject(projectData);
                    setFormData({
                      ...formData,
                      applyForm: Array.from({ length: projectData.recruitForm.length }, () => null),
                    });
                } else {
                    console.log('프로젝트를 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error('프로젝트를 가져오는 동안 오류 발생:', error);
            }
        };
    
        fetchProject();
    }, [dbService, projectId]);
    useEffect(() => {
      const fetchUserDetails = async () => {
        try {
          if (uid) {
            const userDoc = await getDoc(doc(dbService, 'users', uid));
  
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserDetails(userData);
            } else {
              console.log('사용자를 찾을 수 없습니다.');
            }
          }
        } catch (error) {
          console.error('사용자 정보를 가져오는 동안 오류 발생:', error);
        }
      };
  
      fetchUserDetails();
    }, [dbService, uid]);
    const handleReasonChange = (e) => {
      setFormData({...formData, applyReason: e.target.value})
    }
    const handleFormChange = (e, index) => {
        const updatedForm = [...formData.applyForm]
        updatedForm[index] = e.target.value
        setFormData({...formData, applyForm: updatedForm})
    };
    const handleApply = async () => {

      const isAnyNullValue = formData.applyForm.some(value => value === null);
      if (isAnyNullValue) {
        window.alert('지원서의 모든 항목을 작성해주세요!');
        return;
      }

      try {
        // Check if the application already exists
        const existingApplicationQuery = query(
          collection(dbService, 'projectApply'),
          where('projectId', '==', projectId),
          where('userId', '==', uid)
        );

        const existingApplicationSnapshot = await getDocs(existingApplicationQuery);

        if (!existingApplicationSnapshot.empty) {
          window.alert('지원이력이 존재합니다!');
          navigate(`/projectDetail/${projectId}`);
          return;
        }

        const applyRef = await addDoc(collection(dbService, 'projectApply'), {
          projectId: projectId,
          userId: uid,
          userNickname: userDetails?.nickname || '',
          userEmail: userDetails?.email || '',
          applyReason: formData.applyReason,
          applyForm: formData.applyForm,
          status: formData.status,
          createdAt: moment().toDate(),
        });

        console.log('Application completed.');
        window.alert('지원서가 제출되었습니다!');
        navigate(`/projectDetail/${projectId}`);

      } catch (error) {
        console.error('Error adding document: ', error);
      }
    };

    if (!project) {
      return <p>Loading...</p>;
    }

    return (
    <div className={style.body} style={{ overflowY: 'auto' }}>
        <div className={style.titleBox}>
          <div className={style.joinTitle}>
            소모임 지원하기
          </div>
        </div>
        {ProjectHeader(project)}
        <div className={`${style.projectDetail} ${style.projectBody}`}>
          <div className={style.bodyTitle}>소모임 지원서</div>
          <div className={style.bodyForm}>
              <div className={style.formItem}>
                <div className={style.formTitle}>▶ 지원동기</div>
                <textarea
                  value={formData.applyReason}
                  onChange={handleReasonChange}
                />
              </div>
            {project.recruitForm.map((form, index) => (
              <div key={index} className={style.formItem}>
                <div className={style.formTitle}>▶ {form}</div>
                <textarea
                  key={`textarea-${index}`}
                  value={formData.applyForm[index]}
                  onChange={(e) => handleFormChange(e, index)}
                />
              </div>
            ))}
          </div>
          <button onClick={handleApply}>지원서 제출</button>
        </div>
    </div>
    );
}