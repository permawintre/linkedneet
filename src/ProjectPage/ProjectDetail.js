import React, { useState, useEffect } from "react"
import style from './ProjectDetail.module.css'
import { FcAlarmClock, FcCalendar, FcCheckmark, FcGlobe } from "react-icons/fc";
import { doc, getDoc, where, getDocs, collection, query } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { auth, dbService } from '../firebase.js'
import { is } from "date-fns/locale";

const defaultLeaderImg = 'https://s3.amazonaws.com/37assets/svn/765-default-avatar.png';

const getTagColor = (status) => {
    switch (status) {
        case '모집전': return 'tagBeforeRecruiting';
        case '모집중': return 'tagRecruiting';
        case '진행중': return 'tagInProgress';
        case '진행완료': return 'tagCompleted';
        case '진행전': return 'tagBeforeRunning';
    }
}

const setProjectStatus = (project) => {
  const currentDate = new Date();
  const timestampInSeconds = Math.floor(currentDate.getTime() / 1000);

  if (timestampInSeconds >= project.recruitStartDate.seconds && timestampInSeconds <= project.recruitEndDate.seconds) {
    project.status = '모집중';
  }
  else if (timestampInSeconds >= project.runningStartDate.seconds && timestampInSeconds <= project.runningEndDate.seconds) {
    project.status = '진행중';
  }
  else if (timestampInSeconds > project.runningEndDate.seconds) {
    project.status = '진행완료';
  }
  else if (timestampInSeconds < project.recruitStartDate.seconds ) {
    project.status = '모집전';
  }
  else if (timestampInSeconds < project.runningStartDate) {
    project.status = '진행전';
  }
  else {
    project.status = '';
  }
}

function formatDate(timestamp) {
  return new Date(timestamp.seconds * 1000).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
}

const ProjectHeader = ({project, uid, isMember}) => {
    return (
        <div className={style.projectDetail}>
          <div className={style.projectBoxDetail}>
            <span className={`${style.tag} ${style[getTagColor(project.status)]}`}>{project.status}</span>
            <img src={project.image.imageUrl} alt={project.name} />
            <Link to={`/projecthome/${project.id}`} className={`${style.name} ${style[getTagColor(project.status)]}`}>
              {project.name}
            </Link>
            <div className={style.comment}>
              <div>{project.shortDescription}</div>
            </div>
            <div className={style.info}>
              <div>
                <FcAlarmClock />
                <span className={style.infoTitle}>모집기간</span>
                <span className={style.infoContent}>
                  {formatDate(project.recruitStartDate)} ~ {formatDate(project.recruitEndDate)}
                </span>
              </div>
              <div>
                <FcCalendar />
                <span className={style.infoTitle}>운영기간</span>
                <span className={style.infoContent}>
                  {formatDate(project.runningStartDate)} ~ {formatDate(project.runningEndDate)}
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
            <div className={style.tags}>
              {project.tags.map((tag, index) => (
                <div className={style.tagItem} key={index}>
                  # {tag}
                </div>
              ))}
            </div>
          </div>
          <div className={style.projectBoxButtons}>
            {project.leaderId === uid ? (
              <Link to={`/projectManage/${project.id}`} style={{ textDecoration: 'none', color: 'black' }} className={style.recruitButton}>
                소모임 관리하기
              </Link>
            ) : (
              isMember ? (
                <Link to={`/projectHome/${project.id}`} style={{ textDecoration: 'none', color: 'black' }} className={style.recruitButton}>
                  소모임 멤버입니다
                </Link>
              ) : (
                project.status === '모집중' ? (
                  <Link to={`/projectJoin/${project.id}`} style={{ textDecoration: 'none', color: 'black' }} className={style.recruitButton}>
                    소모임 지원하기
                  </Link>
                ) : (
                  <span className={style.recruitButton}>모집기간이 아닙니다</span>
                )
              )
            )}
            <span className={style.shareButton}>공유하기</span>
          </div>
          <div className={style.projectBoxLeader}>
            <span className={style.leaderImage}>
              <img src={project.leaderImage} alt={project.leaderName} />
            </span>
            <span className={style.leaderBody}>
              <Link to={`/profiledetail?uid=${project.leaderId}`}>
              <div className={style.leaderName}>
                <span>{project.leaderName}</span>
                <span className={style.leaderCaption}>리더</span>
              </div>
              </Link>
              <div className={style.leaderComment}>{project.leaderComment}</div>
            </span>
          </div>
        </div>
      );
}

const ProjectBody = (project) => {
    return (
        <div className={`${style.projectDetail} ${style.projectBody}`}>
          <div className={style.bodyTitle}>소모임 소개</div>
          <div className={style.bodyImages}>
              {project.subImages.map((image, index) => (
                  <img key={index} src={image.imageUrl} alt={`Subimage ${index + 1}`} />
              ))}
          </div>
          <div className={style.bodyContent}>{project.introduction}</div>
        </div>
      );
}

const ProjectReview = (project) => {
    return (
        <div className={`${style.projectDetail} ${style.projectBody}`}>
          <div className={style.bodyTitle}>소모임 후기</div>
          <div className={style.bodyContent}>
            {project.reviews.map((review, index) => (
              <div className={style.review} key={index}>
                <span className={style.reviewUser}>{review.nickname}</span>
                <span className={style.reviewDate}>{formatDate(review.created_at)}</span>
                <div className={style.reviewContent}>{review.content}</div>
              </div>
            ))}
          </div>
        </div>
      );
}

export const ProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [uid, setUid] = useState("");
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    // Set uid if the user is authenticated
    if (auth.currentUser) {
      setUid(auth.currentUser.uid);
    }
  }, []);

  useEffect(() => {
    const fetchProjectAndCheckMembership = async () => {
      try {
        // Fetch project data
        const projectDoc = await getDoc(doc(dbService, 'projects', projectId));

        if (projectDoc.exists()) {
          const projectData = projectDoc.data();

          // Fetch leader data
          const leaderDoc = await getDoc(doc(dbService, 'users', projectData.leaderId));
          const leaderData = leaderDoc.data();

          // Update projectData with additional properties
          const updatedProjectData = {
            ...projectData,
            id: projectDoc.id,
            leaderName: leaderData.nickname,
            leaderComment: `니트컴퍼니 ${leaderData.generation}기. ${leaderData.intro_title}`,
            leaderImage: leaderData.profile_img ? leaderData.profile_img : defaultLeaderImg,
            reviews: [
              {
                'nickname': '유저1',
                'content': `야외드로잉은 모여서 그리는 게 아니라 마음이 가는대로 뿔뿔히 흝어져 드로잉하는 방식이였습니다. 그게 조금 아쉬웠지만 야외에서 그리는 감각이 즐거웠습니다.
                              후에 다같이 모여서 드로잉에 대해 얘기를 나누는 시간이 좋았습니다. 몇몇분과 저녁을 같이 먹고 한강 산책을 하고 헤어졌는데 좋은 시간이었어요.`,
                'created_at': new Date('2023-01-30'),
              },
              {
                'nickname': '유저2',
                'content': '다양한 사람들과 친해질 수 있습니다',
                'created_at': new Date('2023-02-28'),
              }
            ]
          };

          // Set project data and status
          setProject(updatedProjectData);
          setProjectStatus(updatedProjectData);
        } else {
          console.log('프로젝트를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('프로젝트를 가져오는 동안 오류 발생:', error);
      }

      try {
        // Fetch projectMember document where userId and projectId match
        const projectMemberCollection = collection(dbService, 'projectMember');
        const memberQuery = query(projectMemberCollection, where('userId', '==', uid), where('projectId', '==', projectId));
        const memberQuerySnapshot = await getDocs(memberQuery);

        // Update isMember state based on whether the document exists
        setIsMember(!memberQuerySnapshot.empty);
      } catch (error) {
        console.error('Error checking project membership: ', error);
      }
    };

    fetchProjectAndCheckMembership();
  }, [dbService, projectId, uid]);

    const [activeSection, setActiveSection] = useState('projectBodySection');
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
    if (!project) {
      return <p>Loading...</p>;
    }
    return (
    <div className={style.body} style={{ overflowY: 'auto' }}>
        {ProjectHeader({'project': project, 'uid': uid, 'isMember': isMember})}
        <div className={style.projectBoxButtons}>
            <span
            className={`${style.projectButton} ${style[activeSection === 'projectBodySection' ? 'active' : '']}`}
            onClick={() => handleButtonClick('projectBodySection')}
            >
            <span className={style.text}>소모임 소개</span>
            </span>
            <span
            className={`${style.projectButton} ${style[activeSection === 'projectMemberSection' ? 'active' : '']}`}
            onClick={() => handleButtonClick('projectMemberSection')}
            >
            <span className={style.text}>이런 멤버를 원해요</span>
            </span>
            <span
            className={`${style.projectButton} ${style[activeSection === 'projectPreparationSection' ? 'active' : '']}`}
            onClick={() => handleButtonClick('projectPreparationSection')}
            >
            <span className={style.text}>준비물</span>
            </span>
            <span
            className={`${style.projectButton} ${style[activeSection === 'projectLocationSection' ? 'active' : '']}`}
            onClick={() => handleButtonClick('projectLocationSection')}
            >
            <span className={style.text}>소모임 위치</span>
            </span>
            <span
            className={`${style.projectButton} ${style[activeSection === 'projectReviewSection' ? 'active' : '']}`}
            onClick={() => handleButtonClick('projectReviewSection')}
            >
            <span className={style.text}>소모임 후기</span>
            </span>
        </div>
        <div id="projectBodySection">
            {activeSection === 'projectBodySection' && ProjectBody(project)}
        </div>
        <div>
            {((activeSection === 'projectMemberSection') || (activeSection === 'projectPreparationSection') || (activeSection === 'projectLocationSection')) &&
            <div className={`${style.projectDetail} ${style.projectBody}`}>
              <div id="projectMemberSection" className={style.bodyTitle}>이런 멤버를 원해요</div>
              <div className={style.bodyContent}>{project.desiredCrew}</div>
              <div id="projectPreparationSection" className={style.bodyTitle}>준비물</div>
              <div className={style.bodyContent}>{project.preparation}</div>
              <div id="projectLocationSection" className={style.bodyTitle}>소모임 위치</div>
              <div className={style.bodyContent}>{project.location}</div>
            </div>
            }
        </div>
        <div id="projectReviewSection">
            {activeSection === 'projectReviewSection' && ProjectReview(project)}
        </div>
    </div>
    );
}