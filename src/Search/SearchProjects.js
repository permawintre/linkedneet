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
    rowClass = "oneRow";
    console.log(rowClass);

    // Return
    return (
        <div className={style.projects}>
          <div className={`${style.projectRow} ${style[rowClass]}`}>
            {projects.map((project, index) => (
                <DetailedProject key={index} project={project} />
              ))}
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