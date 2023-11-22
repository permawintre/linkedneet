// 준비물, 소모임 위치 해야됨.
// 소모임 후기: 방명록 형태 가져오기
// 지원page 만들어야함.
// 리더탭은 리더 프로필과 연결되도록.
// subImages 순서
import React, { useState, useEffect } from "react"
import style from './ProjectDetail.module.css'
import { FcAlarmClock, FcCalendar, FcCheckmark, FcGlobe } from "react-icons/fc";
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const defaultImage = 'https://cdn.imweb.me/upload/S20191010288d21675b22f/e33c22faf15bc.jpg';
const defaultImage2 = 'https://images.freeimages.com/images/large-previews/c22/cat-1395746.jpg'
const defaultImage3 = 'https://www.posist.com/restaurant-times/wp-content/uploads/2023/07/How-To-Start-A-Coffee-Shop-Business-A-Complete-Guide.jpg'
const defaultImage4 = 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Chelonia_mydas_is_going_for_the_air_edit.jpg'

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

function formatDateKR(timestamp) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
function formatDate(date) {
    return new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

const ProjectHeader = (project) => {
    return (
        <div className={style.projectDetail}>
          <div className={style.projectBoxDetail}>
            <span className={`${style.tag} ${style[getTagColor(project.status)]}`}>{project.status}</span>
            <img src={project.image} alt={project.name} />
            <div className={`${style.name} ${style[getTagColor(project.status)]}`}>{project.name}</div>
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
            <div className={style.tags}>
              {project.tags.map((tag, index) => (
                <div className={style.tagItem} key={index}>
                  # {tag}
                </div>
              ))}
            </div>
          </div>
          <div className={style.projectBoxButtons}>
            {project.status === '모집중' ? (
              <Link to={`/projectJoin/${project.id}`} style={{ textDecoration: 'none', color: 'black' }} className={style.recruitButton}>
                  소모임 지원하기
              </Link>
            ) : (
              <span className={style.recruitButton}>모집기간이 아닙니다</span>
            )}
            <span className={style.shareButton}>공유하기</span>
          </div>
          <div className={style.projectBoxLeader}>
            <span className={style.leaderImage}>
              <img src={project.leaderImage} alt={project.leaderName} />
            </span>
            <span className={style.leaderBody}>
              <div className={style.leaderName}>
                <span>{project.leaderName}</span>
                <span className={style.leaderCaption}>리더</span>
              </div>
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
              {project.subImages.slice().reverse().map((image, index) => (
                  <img key={index} src={image} alt={`Subimage ${index + 1}`} />
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

    const db = getFirestore();
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const projectDoc = await getDoc(doc(db, 'projects', projectId));
    
                if (projectDoc.exists()) {
                    const projectData = projectDoc.data();
    
                    // Update projectData with additional properties
                    const updatedProjectData = {
                        ...projectData,
                        id: projectDoc.id,
                        leaderName: '딩스',
                        leaderComment: '니트컴퍼니 2기. 100일 동안 끄적끄적 그림을 그렸습니다. 현재도 끄적끄적 그려나가고 있습니다. 인스타그램 @xoxodingxx',
                        leaderImage: defaultImage3,
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
    
                    setProject(updatedProjectData);
                    setProjectStatus(updatedProjectData); // Move this line inside the if block
                } else {
                    console.log('프로젝트를 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error('프로젝트를 가져오는 동안 오류 발생:', error);
            }
        };
    
        fetchProject();
    }, [db, projectId]);

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
        {ProjectHeader(project)}
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