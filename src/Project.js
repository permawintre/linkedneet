import React, { useState } from "react"
import './Project.css'
import { Link } from 'react-router-dom';

const UserProject = ({ project }) => {
    return (
        <div className="project-box">
            <img src={project.image} alt={project.name} /> {/* alt 속성 추가 */}
            <div className="name">{project.name}</div>
            <div className="comment">{project.comment}</div>
        </div>
    );
};
const DetailedProject = ({ project }) => {
    const getTagColor = (status) => {
        switch (status) {
            case '모집중': return 'tag-recruiting';
            case '진행중': return 'tag-in-progress';
            case '진행완료': return 'tag-completed';
        }
    }
    return (
        <div className="project-box">
            <span className={`tag ${getTagColor(project.status)}`}>{project.status}</span>
            <img src={project.image} alt={project.name} /> {/* alt 속성 추가 */}
            <Link to="/projectDetail" style={{ textDecoration: 'none' }} className="name">{project.name}</Link>
            <div className="comment">{project.comment}</div>
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
        { name: '요리보고 채식보고', image: defaultImage, comment: '설명입니다.' },
        { name: '달이 뜨면 오늘 하루를 마무리해요', image: defaultImage2, comment: '설명입니다.' },
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
        <div className="projects">
            <div className="my-projects-title navigation">
                <button onClick={showPreviousPage}>{'<'}</button>
                <span className="projects-title">나의 소모임</span>
                <button onClick={showNextPage}>{'>'}</button>
            </div>
            <div className="projects-row">
                {visibleProjects.map((project, index) => (
                    <UserProject key={index} project={project} />
                ))}
            </div>
        </div>
    );
};

const ProjectList = () => {
    const myProjects = [
        { name: '느긋 느슨 그림그리기 크랍 11월', image: defaultImage4, comment: '한 달 동안 우리 함께 그림 루틴 만들어 볼까요?', type:'루틴', form:'온라인', status:'모집중'},
        { name: '니트니까 평일에 롯데월드', image: defaultImage3, comment: '니트의 특권으로 평일에 놀아요 :)', type:'관계', form:'오프라인', status:'진행중' },
        { name: '요리보고 채식보고', image: defaultImage4, comment: '설명입니다.', type:'관계', form:'온라인', status:'진행중' },
        { name: '달이 뜨면 오늘 하루를 마무리해요', image: defaultImage2, comment: '설명입니다.' , type:'경험', form:'오프라인', status:'모집중' },
        { name: '사부작 모임', image: defaultImage, comment: '설명입니다.' , type:'경험', form:'온라인', status:'모집중' },
        { name: '바꿔바꿔 니트(knit) 교환 장터', image: defaultImage3, comment: '설명입니다.', type:'경험', form:'온라인', status:'모집중' },
        { name: 'Firebase AND React', image: defaultImage3, comment: '구현하면서 배우는 소모임', type:'경험', form:'온오프라인', status:'모집중' },
        { name: 'Tech for Impact', image: defaultImage4, comment: '금요일 13:00 ~ 16:00', type:'루틴', form:'온라인', status:'진행완료' },
        { name: 'School of Computing', image: defaultImage3, comment: '전산학부에 관한 설명입니다.', type:'루틴', form:'진행완료', status:'모집중' },
        { name: '10번째 소모임', image: defaultImage2, comment: '^_^', type:'루틴', form:'온라인', status:'모집중' },
        { name: '11번째 소모임', image: defaultImage, comment: '이건 11번째입니다.', type:'루틴', form:'오프라인', status:'진행완료' },
    ];
    // For Search Bar
    const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태 추가
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    // For Dropdowns
    const statuses = ['전체', '모집중', '진행중', '진행완료'];
    const forms = ['전체', '온라인', '오프라인', '온오프라인'];
    const types = ['전체', '루틴', '관계', '경험'];
    const [selectedStatus, setSelectedStatus] = useState('전체'); // 모집중, 진행중, 진행완료
    const [selectedForm, setSelectedForm] = useState('전체'); // 온라인, 오프라인, 온오프라인
    const [selectedType, setSelectedType] = useState('전체'); // 루틴, 관계, 경험
    const filteredProjects = myProjects.filter(project => {
        return (
            (selectedType === '전체' || project.type === selectedType) &&
            (selectedForm === '전체' || project.form === selectedForm) &&
            (selectedStatus === '전체' || project.status === selectedStatus) &&
            (project.name.toLowerCase().includes(searchTerm.toLowerCase())) // 검색어 필터링 추가
        );
    });
    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
    };
    const handleFormChange = (e) => {
        setSelectedForm(e.target.value);
    };
    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
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
        <div className="projects">
            <div className="project-list-header">
                <div className="projects-title-header">
                    <span className="line">-</span>
                    <span className="projects-title">더 많은 소모임을 찾아보세요!</span>
                    <span className="line">-</span>
                </div>
                <div className="projects-filter">
                    <span className="searchbar">
                        <div>이름으로 검색하기</div>
                        <input
                            type="text"
                            placeholder="소모임 이름 검색"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </span>
                    <div className="filter-dropdowns">
                        <span className="dropdown">
                            <div>모집 기간</div>
                            <select onChange={handleStatusChange}>
                                {statuses.map((status, index) => (
                                    <option key={index} value={status}>{status}</option>
                                ))}
                            </select>
                        </span>
                        <span className="dropdown">
                            <div>소모임 형태</div>
                            <select onChange={handleTypeChange}>
                                {types.map((type, index) => (
                                    <option key={index} value={type}>{type}</option>
                                ))}
                            </select>
                        </span>
                        <span className="dropdown">
                            <div>소모임 분류</div>
                            <select onChange={handleFormChange}>
                                {forms.map((form, index) => (
                                    <option key={index} value={form}>{form}</option>
                                ))}
                            </select>
                        </span>
                    </div>
                </div>
            </div>
            {[...Array(totalRows)].map((_, rowIndex) => (
                <div key={rowIndex} className="projects-row">
                    {visibleProjects
                        .slice(rowIndex * itemsPerRow, (rowIndex + 1) * itemsPerRow)
                        .map((project, index) => (
                            <DetailedProject key={index} project={project} />
                        ))}
                </div>
            ))}
            <div className="navigation">
                <button onClick={showPreviousPage} disabled={page === 0}>{'<'}</button>
                <span>{page + 1} / {totalPages}</span>
                <button onClick={showNextPage} disabled={page === totalPages - 1}>{'>'}</button>
            </div>
        </div>
    );
};

export const Project = () => {
    return (
        <div className="body">
            <MyProject/>
            <ProjectList/>
        </div>
    );
}