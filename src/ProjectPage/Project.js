import React, { useEffect, useState } from "react"
import style from './Project.module.css'
import { Link } from 'react-router-dom';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';

const UserProject = ({ project }) => {
    return (
      <div className={style.projectBox}>
        <img src={project.image} alt={project.name} />
        <div className={style.name}>{project.name}</div>
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

const defaultImage = 'https://cdn.imweb.me/upload/S20191010288d21675b22f/e33c22faf15bc.jpg';
const defaultImage2 = 'https://images.freeimages.com/images/large-previews/c22/cat-1395746.jpg'
const defaultImage3 = 'https://www.posist.com/restaurant-times/wp-content/uploads/2023/07/How-To-Start-A-Coffee-Shop-Business-A-Complete-Guide.jpg'
const defaultImage4 = 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Chelonia_mydas_is_going_for_the_air_edit.jpg'

const MyProject = () => {
    const myProjects = [
        { name: '느긋 느슨 그림그리기 크랍 11월', image: defaultImage, comment: '한 달 동안 우리 함께 그림 루틴 만들어 볼까요?' },
        { name: '니트니까 평일에 롯데월드', image: defaultImage2, comment: '니트의 특권으로 평일에 놀아요 :)' },
        { name: '요리보고 채식보고', image: defaultImage3, comment: '설명입니다.' },
        { name: '달이 뜨면 오늘 하루를 마무리해요', image: defaultImage4, comment: '설명입니다.' },
        { name: '사부작 모임', image: defaultImage, comment: '설명입니다.' },
        { name: '바꿔바꿔 니트(knit) 교환 장터', image: defaultImage2, comment: '설명입니다.' },
    ];

    const itemsPerPage = 3;
    const [page, setPage] = useState(0);

    const totalPages = Math.ceil(myProjects.length / itemsPerPage);

    const showPreviousPage = () => {
        setPage((prev) => (prev > 0 ? prev - 1 : prev));
    };
    
    const showNextPage = () => {
        setPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
    };

    const visibleProjects = myProjects.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    return (
        <div className={style.projects}>
            <div className={`${style.myProjectsTitle} ${style.navigation}`}>
                <button onClick={showPreviousPage}>{'<'}</button>
                <span className={style.projectsTitle}>나의 소모임</span>
                <button onClick={showNextPage}>{'>'}</button>
            </div>
            <div className={style.projectsRow}>
                {visibleProjects.map((project, index) => (
                    <UserProject key={index} project={project} />
                ))}
            </div>
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

const ProjectList = () => {

    const [myProjects, setMyProjects] = useState([]);

    
    // Firestore에서 데이터를 가져오는 useEffect
    useEffect(() => {
      const fetchProjects = async () => {
        const db = getFirestore(); // Firestore 인스턴스 얻기
        const projectsCollection = collection(db, 'projects');
        const q = query(projectsCollection, orderBy('createdAt', 'desc'));
        
        try {
          const querySnapshot = await getDocs(q);
          const projectsData = [];
          querySnapshot.forEach((doc) => {
            const newObj = {
                ...doc.data(),
                id: doc.id,
            };
            projectsData.push(newObj);
          });
          setMyProjects(projectsData);
        } catch (error) {
          console.error('Error fetching projects: ', error);
        }
      };

      fetchProjects(); // 함수 호출

    }, []); // 빈 배열은 컴포넌트가 마운트될 때 한 번만 실행

    myProjects.forEach((project) => {
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
    const filteredProjects = myProjects.filter(project => {
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
    return (
        <div className={style.body}>
            <MyProject/>
            <ProjectList/>
        </div>
    );
}