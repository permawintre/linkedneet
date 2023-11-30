import React, { useEffect, useState } from "react"
import algoliasearch from "algoliasearch/lite";
import style from './SearchProjects.module.css'
import { Link } from 'react-router-dom';
import { InstantSearch, useHits , Configure} from 'react-instantsearch-hooks-web';

const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_ID,
  process.env.REACT_APP_ALGOLIA_SEARCH_KEY
);

const ProjectList = ({ isEmpty, projects }) => {

    const setProjectStatus = (project) => {
      const currentDate = new Date();
      const timestampInSeconds = Math.floor(currentDate.getTime());
    
      if (timestampInSeconds >= project.recruitStartDate && timestampInSeconds <= project.recruitEndDate) {
        project.status = '모집중';
      }
      else if (timestampInSeconds >= project.runningStartDate && timestampInSeconds <= project.runningEndDate) {
        project.status = '진행중';
      }
      else if (timestampInSeconds > project.runningEndDate) {
        project.status = '진행완료';
      }
      else if (timestampInSeconds < project.recruitStartDate) {
        project.status = '모집전';
      }
      else if (timestampInSeconds < project.runningStartDate) {
        project.status = '진행전';
      }
      else {
        project.status = '';
      }
    }
  
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

    projects.forEach((project) => {
      setProjectStatus(project);
    });
    const projectCount = projects.length;
    let rowClass;
    // if (projectCount === 0) {
    //   rowClass = "zeroRow";
    // } else if (projectCount <= 3) {
    //   rowClass = "oneRow";
    // } else {
    //   rowClass = "twoRow";
    // }
    rowClass = "oneRow";
    console.log(rowClass);

    // For Navigation Button
    const itemsPerRow = 2; // 한 줄 당 아이템 수
    const totalRows = 1; // 총 줄 수
    const itemsPerPage = itemsPerRow * totalRows; // 페이지 당 아이템 수
    const [page, setPage] = useState(0); // 페이지 상태
    const totalPages = Math.ceil(projects.length / itemsPerPage); // 전체 페이지 수
    // 이전 페이지 보기
    const showPreviousPage = () => {
        setPage((prev) => (prev > 0 ? prev - 1 : prev));
    };
    // 다음 페이지 보기
    const showNextPage = () => {
        setPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
    };
    // 현재 페이지에 해당하는 프로젝트 가져오기
    const visibleProjects = projects.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    // Return
    return (
        <div className={style.projects}>
          <div className={`${style.projectsRecommand} ${style[rowClass]}`}>
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

export const SearchProjects = ({ searchterm }) => {

    const HitsComponent = () => {
        const { hits } = useHits();
        // hits 배열의 각 항목에 'id' 필드 추가
        const projects = hits.map(hit => ({
            ...hit,
            id: hit.objectID  // Algolia의 objectID를 id 필드로 설정
        }));

        console.log(hits[0])

        if (hits.length === 0) {
            return <h1 className="profiles-row-center">소모임 검색 결과가 없어요... T^T</h1>;
        }
        return (
            <ProjectList isEmpty={false} projects={projects}/>
        );
      };

    return (
      <InstantSearch searchClient={searchClient} indexName="projects">
        <Configure query={searchterm} />
        <HitsComponent />
      </InstantSearch>
    );
};