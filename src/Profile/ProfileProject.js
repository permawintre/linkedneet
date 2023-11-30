import React, { useRef, useState, useEffect } from 'react';
import algoliasearch from "algoliasearch/lite";
import style from './ProfileProject.module.css'
import { Link } from 'react-router-dom';
import { InstantSearch, useHits , Configure} from 'react-instantsearch-hooks-web';
import { collection, getDocs } from 'firebase/firestore';
import { dbService } from '../firebase';
import { Bars } from "react-loader-spinner";

const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_ID,
  process.env.REACT_APP_ALGOLIA_SEARCH_KEY
);

const ProjectList = ({ projects }) => {
    const setProjectStatus = (project) => {
      const millisecondsInADay = 24 * 60 * 60 * 1000; // 1일을 밀리초로 표현
      const secondsInADay = 24 * 60 * 60;
      const currentDate = new Date();
      const currentTimestampInDays = Math.floor(currentDate.getTime() / millisecondsInADay);
    
      const recruitStartDateInDays = Math.floor(project.recruitStartDate.seconds / secondsInADay);
      const recruitEndDateInDays = Math.floor(project.recruitEndDate.seconds / secondsInADay);
      const runningStartDateInDays = Math.floor(project.runningStartDate.seconds / secondsInADay);
      const runningEndDateInDays = Math.floor(project.runningEndDate.seconds / secondsInADay);
    
      if (currentTimestampInDays >= recruitStartDateInDays && currentTimestampInDays <= recruitEndDateInDays) {
        project.status = '모집중';
      }
      else if (currentTimestampInDays >= runningStartDateInDays && currentTimestampInDays <= runningEndDateInDays) {
        project.status = '진행중';
      }
      else if (currentTimestampInDays > runningEndDateInDays) {
        project.status = '진행완료';
      }
      else if (currentTimestampInDays < recruitStartDateInDays) {
        project.status = '모집전';
      }
      else if (currentTimestampInDays < runningStartDateInDays) {
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
    let rowClass = "oneRow";

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
    const [allProjectsSnapshot, setAllProjectsSnapshot] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
      const fetchProjects = async () => {
        try {
          // Fetch all projects from the 'projects' collection
          const projectsCollection = collection(dbService, 'projects');
          const allSnapshot = await getDocs(projectsCollection);
          setAllProjectsSnapshot(allSnapshot);
        } catch (error) {
          console.error('Error fetching projects: ', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProjects();
    }, [searchterm]);
    
    const HitsComponent = () => {
        alert(JSON.stringify(allProjectsSnapshot))
        const { hits } = useHits();
        const projectMembers = hits.map(hit => ({
            ...hit,
            id: hit.objectID
        }));
        const allProjectsData = {};
        allProjectsSnapshot.forEach((doc) => {
          allProjectsData[doc.id] = { ...doc.data() };
        });
        const projects = projectMembers.map(projectMember => ({
            ...allProjectsData[projectMember.projectId], 
            id: projectMember.id
        }));

        console.log(hits[0])

        if (hits.length === 0) {
            return (<div className="no-posts-message">참여하고 있는 소모임이 없습니다</div>);
        }
        return (
            <ProjectList projects={projects}/>
        );
      };
    if (isLoading) {
      return (
        <div className="loadingContainer">
          <Bars
            type="ThreeDots"
            color="#00b22d"
            height={100}
            width={100}
          />
        </div>);
    }
    else {
    return (
      <div className="container-post">
            <main className='profile-post-main'>
                <h2>소모임</h2>
                <div className="profile-post-list">
                  <InstantSearch searchClient={searchClient} indexName="projectMember">
                    <Configure query={searchterm} />
                    <HitsComponent />
                  </InstantSearch>
                </div>
            </main>
        </div>
    );
    }
};