import React, { useEffect, useState } from "react"
import style from './Project.module.css'
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs, where, getDoc, doc } from 'firebase/firestore';
import { dbService, auth } from '../firebase.js';

const UserProject = ({ uid, project }) => {
    return (
      <div className={style.projectBox}>
        {project.leaderId === uid ? (
          <span className={`${style.tag} ${style.tagBeforeRunning}`}>관리자</span>
        ) : (<span></span>)}
        {project.default ? (
          <img src={project.image} alt={project.name} />
        ) : (
          <img src={project.image.imageUrl} alt={project.name} />
        )}
        <Link to={`/projecthome/${project.id}`} style={{ textDecoration: 'none' }} className={style.name}>
          {project.name}
        </Link>
        <div className={style.comment}>{project.shortDescription}</div>
      </div>
    );
  };
const DetailedProject = ({ project }) => {
    const getTagColor = (status) => {
        switch (status) {
            case '모집전': return 'tagBeforeRecruiting';
            case '모집중': return 'tagRecruiting';
            case '진행중': return 'tagInProgress';
            case '진행완료': return 'tagCompleted';
            case '진행전': return 'tagBeforeRunning';
        }
    }
    return (
    <div className={style.projectBox}>
        <span className={`${style.tag} ${style[getTagColor(project.status)]}`}>{project.status}</span>
        <img src={project.image.imageUrl} alt={project.name} />
        <Link to={`/projectDetail/${project.id}`} style={{ textDecoration: 'none' }} className={style.name}>
            {project.name}
        </Link>
        <div className={style.comment}>{project.shortDescription}</div>
    </div>
      );
};
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
  else if (timestampInSeconds < project.recruitStartDate.seconds) {
    project.status = '모집전';
  }
  else if (timestampInSeconds < project.runningStartDate) {
    project.status = '진행전';
  }
  else {
    project.status = '';
  }
}

const MyProject = ({ uid, myProjects }) => {
    // For Navigation Button
    const itemsPerRow = 3; // 한 줄 당 아이템 수
    const totalRows = 1; // 총 줄 수
    const itemsPerPage = itemsPerRow * totalRows; // 페이지 당 아이템 수
    const [page, setPage] = useState(0); // 페이지 상태
    const totalPages = Math.ceil(myProjects.length / itemsPerPage); // 전체 페이지 수
    // 이전 페이지 보기
    const showPreviousPage = () => {
        setPage((prev) => (prev > 0 ? prev - 1 : prev));
    };
    // 다음 페이지 보기
    const showNextPage = () => {
        setPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
    };
    // 현재 페이지에 해당하는 프로젝트 가져오기
    const visibleProjects = myProjects.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
    const defaultProject = {
      default: true,
      name: '새로운 소모임에 가입하세요!',
      shortDescription: '',
      image: 'https://images.pexels.com/photos/1731427/pexels-photo-1731427.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
    };
    // myProjects 개수가 itemsPerRow 미만이면 default로 채운다
    const paddedVisibleProjects = [
      ...visibleProjects,
      ...Array(Math.max(0, itemsPerRow - visibleProjects.length)).fill(defaultProject)
    ];
  
    return (
      <div className={style.projects}>
        <div className={style.myProjects}>
          <div className={`${style.projectsTitle} ${style.navigation}`}>
            <span className={style.projectsTitle}>나의 소모임</span>
          </div>
          <div className={style.projectsRow}>
            {paddedVisibleProjects.map((project, index) => (
              project ? (
                <UserProject key={index} uid={uid} project={project} />
              ) : (
                <div key={index} className={style.emptyProject}></div>
              )
            ))}
          </div>
          <div className={style.navigation}>
            <button onClick={showPreviousPage} disabled={page === 0}>{'<'}</button>
            <span>{page + 1} / {totalPages}</span>
            <button onClick={showNextPage} disabled={page === totalPages - 1}>{'>'}</button>
          </div>
        </div>
      </div>
    );
  };

const ProjectList = ({ projects }) => {

    projects.forEach((project) => {
      setProjectStatus(project);
    });

    // For Search Bar
    const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태 추가
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    // For Dropdowns
    const statuses = ['전체', '모집중', '진행중', '진행완료'];
    const types = ['전체', '온라인', '오프라인', '온오프라인'];
    const categories = ['전체', '루틴', '관계', '경험'];
    const [selectedStatus, setSelectedStatus] = useState('전체'); // 모집중, 진행중, 진행완료
    const [selectedType, setSelectedType] = useState('전체'); // 온라인, 오프라인, 온오프라인
    const [selectedCategory, setSelectedCategory] = useState('전체'); // 루틴, 관계, 경험
    const filteredProjects = projects.filter(project => {
        return (
            (selectedStatus === '전체' || project.status === selectedStatus) &&
            (selectedType === '전체' || project.type === selectedType) &&
            (selectedCategory === '전체' || project.category === selectedCategory) &&
            (project.name.toLowerCase().includes(searchTerm.toLowerCase())) // 검색어 필터링 추가
        );
    });
    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
    };
    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
    };
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    // For Navigation Button
    const itemsPerRow = 3; // 한 줄 당 아이템 수
    const totalRows = 2; // 총 줄 수
    const itemsPerPage = itemsPerRow * totalRows; // 페이지 당 아이템 수
    const [page, setPage] = useState(0); // 페이지 상태
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage); // 전체 페이지 수
    // 이전 페이지 보기
    const showPreviousPage = () => {
        setPage((prev) => (prev > 0 ? prev - 1 : prev));
    };
    // 다음 페이지 보기
    const showNextPage = () => {
        setPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
    };
    // 현재 페이지에 해당하는 프로젝트 가져오기
    const visibleProjects = filteredProjects.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    // Return
    return (
        <div className={style.projects}>
          <div className={style.projectListHeader}>
            <div className={style.projectsTitleHeader}>
              <span className={style.line}>-</span>
              <span className={style.projectsTitle}>더 많은 소모임을 찾아보세요!</span>
              <span className={style.line}>-</span>
            </div>
            <div className={style.projectsFilter}>
              <span className={style.searchbar}>
                <div>이름으로 검색하기</div>
                <input
                  type="text"
                  placeholder="소모임 이름 검색"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </span>
              <div className={style.filterDropdowns}>
                <span className={style.dropdown}>
                  <div>모집 기간</div>
                  <select onChange={handleStatusChange}>
                    {statuses.map((status, index) => (
                      <option key={index} value={status}>{status}</option>
                    ))}
                  </select>
                </span>
                <span className={style.dropdown}>
                  <div>소모임 형태</div>
                  <select onChange={handleTypeChange}>
                    {types.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </span>
                <span className={style.dropdown}>
                  <div>소모임 분류</div>
                  <select onChange={handleCategoryChange}>
                    {categories.map((form, index) => (
                      <option key={index} value={form}>{form}</option>
                    ))}
                  </select>
                </span>
              </div>
            </div>
          </div>
          <div className={style.projectsRecommand}>
            <div className={style.newProject}>
              <div className={style.newProjectSmall}>원하는 소모임이 없다면?</div>
              <Link to="/projectcreate" style={{ textDecoration: 'none' }}>
                <div className={style.newProjectLarge}>소모임 만들기 ▶</div>
              </Link>
            </div>
            {[...Array(totalRows)].map((_, rowIndex) => (
              <div key={rowIndex} className={style.projectsRow}>
                {visibleProjects
                  .slice(rowIndex * itemsPerRow, (rowIndex + 1) * itemsPerRow)
                  .map((project, index) => (
                    <DetailedProject key={index} project={project} />
                  ))}
              </div>
            ))}
          </div>
          <div className={style.navigation}>
            <button onClick={showPreviousPage} disabled={page === 0}>{'<'}</button>
            <span>{page + 1} / {totalPages}</span>
            <button onClick={showNextPage} disabled={page === totalPages - 1}>{'>'}</button>
          </div>
        </div>
      );
};

export const Project = () => {
  const uid = auth.currentUser.uid;
  const [myProjects, setMyProjects] = useState([]);
  const [recommendProjects, setRecommendProjects] = useState([]);
  
  useEffect(() => {
    const fetchProjects = async () => {
      // Fetch projectMember documents where userId matches uid
      const projectMemberCollection = collection(dbService, 'projectMember');
      const memberQuery = query(projectMemberCollection, where('userId', '==', uid));
  
      try {
        const memberQuerySnapshot = await getDocs(memberQuery);
  
        const projectIds = memberQuerySnapshot.docs.map((doc) => doc.data().projectId);
  
        // Fetch all projects from the 'projects' collection
        const projectsCollection = collection(dbService, 'projects');
        const allProjectsSnapshot = await getDocs(projectsCollection);
  
        // Map all project data into an object for quick access
        const allProjectsData = {};
        allProjectsSnapshot.forEach((doc) => {
          allProjectsData[doc.id] = { id: doc.id, ...doc.data() };
        });
  
        // Separate projects into myProjects and recommendProjects
        const myProjectsData = [];
        const recommendProjectsData = [];

        Object.keys(allProjectsData).forEach((projectId) => {
          const projectData = allProjectsData[projectId];
          if (projectIds.includes(projectId)) {
            myProjectsData.push(projectData);
          } else {
            recommendProjectsData.push(projectData);
          }
        });
  
        setMyProjects(myProjectsData);
        setRecommendProjects(recommendProjectsData);
      } catch (error) {
        console.error('Error fetching projects: ', error);
      }
    };
  
    fetchProjects();
  }, [uid]);

    console.log(myProjects);
    console.log(recommendProjects);

    return (
        <div className={style.body}>
            <MyProject uid={uid} myProjects={myProjects}/>
            <ProjectList projects={recommendProjects}/>
        </div>
    );
}