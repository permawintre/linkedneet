import React from "react"
import { getDayMinuteCounter, PostContents, PostPics, LikeBtn, CommentBtn, PlusBtn, CommentsWindow, WriteCommentContainer, addNewComment } from './supportFunctions'
import style from './ProjectHome.module.css'
import { initializeApp } from 'firebase/app';
import { Link, useParams } from "react-router-dom"
import { dbService , auth } from '../firebase.js'
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    addDoc,
    startAfter,
    doc,
    getDoc,
    where,
    updateDoc,
    deleteDoc
} from "firebase/firestore"
import { useEffect, useState } from 'react'
import close from '../images/close.png'
import moment from 'moment'
import styled from 'styled-components'
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid'; // 랜덤 식별자를 생성해주는 라이브러리
import { storage } from '../firebase.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FcAlarmClock, FcCalendar, FcCheckmark, FcGlobe } from "react-icons/fc";


import profile1Img from '../images/profile1Img.jpg'

const user = auth.currentUser;
const userName = "홍길동"
const companyClass = 14
const moims = ['모임 a', '모임 b', '모임 c']


function Post(props) {
    const projectId = props.projectId;
    const userId = props.userId;
    const postId = props.postId
    const postedAt = props.postedAt
    const [comments, setComments] = useState([]);
    const [numOfLikes, setNumOfLikes] = useState(props.numOfLikes);
    const [whoLikes, setWhoLikes] = useState(props.whoLikes);
    const [imgUrls, setImgUrls] = useState([])
    const contents = props.contents
    const [postUserInfo, setPostUserInfo] = useState({ profileImage: '', nickname: '' });
    const postWhere = props.postWhere;

    const addNewComment = (newComment) => {
        setComments(prevComments => [...prevComments, newComment]);
    };
    const [showDropdown, setShowDropdown] = useState(false);
    const [isWriteOpen, setIsWriteOpen] = useState(false);

    useEffect(() => {
        const fetchPostUserInfo = async () => {
            try {
                if (userId) {
                    const userRef = doc(dbService, 'users', userId);
                    const userSnap = await getDoc(userRef);
    
                    if (userSnap.exists()) {
                        setPostUserInfo({
                            profileImage: userSnap.data().profile_image,
                            nickname: userSnap.data().nickname,
                            generation: userSnap.data().generation

                        });
                    } else {
                        console.log("User not found!");
                    }
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        };
        fetchPostUserInfo();
    }, [userId]);

    useEffect(() => {
        setImgUrls([])
        for(let i=0;i<props.imgUrls.length;i++){
            (async () => {
                await getDownloadURL(ref(storage, props.imgUrls[i]))
                    .then((downloadUrl) => {
                        setImgUrls(prev => [...prev, downloadUrl])
                    })
            })()
        }
    },[])

    useEffect(() => {
        const fetchComments = async () => {
            if (postId) { // postId가 유효한 경우에만 쿼리 실행
                const q = query(collection(dbService, 'comments'), where('postId', '==', postId));
                const querySnapshot = await getDocs(q);
                const commentsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setComments(commentsData); // 상태 업데이트
            }
            else{
                console.error('Value is undefined!');
            }
        };
    
        fetchComments();
    }, [postId]);

    const postWriteEditBtnClick = ()=> {
        setShowDropdown(!showDropdown);
        console.log('아이콘 클릭!');
        // 추가적인 핸들러 로직
    }
    const handleDelete =async () => {
        console.log('삭제 클릭');
        const confirmDelete = window.confirm("정말로 삭제하시겠습니까?");
        if (confirmDelete) {
            // Firebase에서 게시물 삭제
            try {
                await deleteDoc(doc(dbService, "projectPosts", postId));
                // UI 업데이트 로직 (예: 상태 업데이트 또는 부모 컴포넌트에 알림)
            } catch (error) {
                console.error("Error removing document: ", error);
            }
        }
        // 삭제 관련 로직
      };
      
      const handleEdit = () => {
        console.log('수정 클릭');
        setIsWriteOpen(true);
        // 수정 관련 로직
      };

    return (
        <div className={style.homePost}>
            <div className={style.paddingDiv}>
                <div className={style.postHeader}>
                    <Link to={`/profiledetail?uid=${props.userId}`}>
                        <div className={style.profileImg}><img src={postUserInfo.profileImage || profile1Img} alt="profileImg"/></div>
                    </Link>
                    <div className={style.postInfo}>
                        <Link to={`/profiledetail?uid=${props.userId}`}>
                            <div className={style.userName}>{postUserInfo.nickname || userName}<div className={style.postWhere}>▸{postWhere}</div></div>
                            <div className={style.inGroup}>
                                    {postUserInfo.generation+'기' || companyClass+'기'}{moims.map((moim, idx)=>(<span key={idx}>{', '}{moim}</span>))}
                            </div>
                            <div className={style.postedWhen}>{getDayMinuteCounter(postedAt)}</div>
                        </Link>
                    </div>
                    {auth.currentUser.uid === userId && (
                        <div className={style.menuIcon} onClick={postWriteEditBtnClick}>
                            <FontAwesomeIcon icon={faEllipsisV} />
                            {showDropdown && (
                                <div className={style.dropdownMenu}>
                                <div className={style.menuItem} onClick={handleDelete}>삭제</div>
                                <div className={style.menuItem} onClick={handleEdit}>수정</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <PostContents contents={contents} />
            </div>
            {imgUrls.length === 0 ? null : <PostPics imgs={imgUrls} />}
            <div className={style.postFooter}>
                <LikeBtn
                    postId = {postId}
                    numOfLikes = {numOfLikes}
                    setNumOfLikes = {setNumOfLikes}
                    whoLikes = {whoLikes}
                    setWhoLikes = {setWhoLikes}
                />
                <CommentBtn />
            </div>
            <hr></hr>
            <div className={style.numOfLikes}>
                {numOfLikes===0? <span></span> : <span>{numOfLikes}명이 응원합니다 </span>}
            </div>
            <CommentsWindow comments={comments} numOfComments={comments.length}/>
            <WriteCommentContainer userProfileImage = {props.userInfo?.profile_image} postId = {postId} userId ={auth.currentUser.uid} addNewComment={addNewComment}/>
            <Write
                projectId={projectId}
                isOpen={isWriteOpen}
                setIsOpen={setIsWriteOpen}
                existingPost={{
                contents: contents, 
                imgUrls: imgUrls,  
                postId: postId
                }}
                showHeader={false}
            />
        </div>
    )
}

const Posts=({ projectId, userInfo }) =>{
    const [posts, setPosts] = useState([]);
    const [lastKey, setLastKey] = useState(0);
    const [nextPosts_loading, setNextPostsLoading] = useState(false);


    const initFetch = async () => {

        try {
            let posts = [];
            let lastKey = '';
            const q = query(
                collection(dbService, 'projectPosts'),
                where("projectId", "==", projectId),
                orderBy("postedAt", "desc"),
                limit(5)
            );
            const data = await getDocs(q);
            console.log("DATA", data);
            data.forEach((doc) => {
                posts.push({
                    ...doc.data(),
                    postId: doc.id
                });
                lastKey = doc.data().postedAt;
            })
            return { posts, lastKey };
        } catch (e) {
            console.log(e);
        }
    }
    const moreFetch = async (key) => {
        
        try {
            let posts = [];
            let lastKey = '';
            const q = query(
                collection(dbService, 'projectPosts'),
                orderBy("postedAt", "desc"),
                startAfter(key),
                limit(1)
            );
            const data = await getDocs(q);
            data.forEach((doc) => {
                posts.push({
                    ...doc.data(),
                    postId: doc.id
                });
                lastKey = doc.data().postedAt;
            })
            return { posts, lastKey };
        } catch (e) {
            console.log(e);
        }
    }
    useEffect(() => {
        initFetch()
            .then((res) => {
                setPosts(res.posts);
                setLastKey(res.lastKey);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [])

    const fetchMorePosts = (key) => {
        if (key > 0) {
          setNextPostsLoading(true);
          moreFetch(key)
            .then((res) => {
              setLastKey(res.lastKey);
              // add new posts to old posts
              setPosts(posts.concat(res.posts));
              setNextPostsLoading(false);
            })
            .catch((err) => {
              console.log(err);
              setNextPostsLoading(false);
            });
        }
    };
    const allPosts = (
        <div>
          {posts.map((post) => {
            const date = new Date(post.postedAt*1000) // js timestamp = unix timestamp * 1000 밀리세컨드단위라 환산해야함
            
            return (
              <div key={post.postId}>
                <Post
                    contents = {post.contents}
                    postedAt = {date}
                    imgUrls = {post.imgUrls}
                    numOfLikes = {post.numOfLikes}
                    numOfComments = {post.numOfComments}
                    whoLikes = {post.whoLikes}
                    postId = {post.postId}
                    userId= {post.userId}
                    postWhere = {post.postWhere}
                    userInfo={userInfo}
                />
                <div className={style.postFooter}>
                </div>
            
            
              </div>
              
            );
          })}
        </div>
      );
      useEffect(() => {
        const handleScroll = () => {
          const { scrollTop, offsetHeight } = document.documentElement
          if (window.innerHeight + scrollTop >= offsetHeight-1000) {
            setNextPostsLoading(true)
          }
        }
        setNextPostsLoading(true)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
      }, [])

      useEffect(() => {
        if (nextPosts_loading && lastKey>0) fetchMorePosts(lastKey)
        else if (!(lastKey>0)) setNextPostsLoading(false)
      }, [nextPosts_loading])

      return (
        <div>
            <div>{allPosts}</div>
            <div style={{ textAlign: "center" }}>
                {nextPosts_loading ? (
                    <p>Loading..</p>
                ) : lastKey > 0 ? (
                    null
                ) : (
                    <span>You are up to date!</span>
                )}
            </div>
        </div>
      );

    
}

function DndBox(props) {

    const [isDragging, setIsDragging] = useState(false);
    const [deleted, setDeleted] = useState(false);
    
    // 부모 컴포넌트에서 내려준 contentImage state
    const contentImages = props.contentImages;
    const setContentImages = props.setContentImages;

    const readImage = (image) => {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = (e) => {
            
            setContentImages(contentImages => [...contentImages, String(e.target?.result)]);
        };
        
    };

    

    const onDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      };
      const onDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      };
      const onDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files) {
          setIsDragging(true);
        }
      };
      const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files || e.target.files;
        for(let i=0;i<files.length;i++){
            readImage(files[i]);
        }
        setIsDragging(false);
      };
      
      const StyledCpnt = styled.div`
        border: ${(props) => props.$isDragging ? '3px dotted #808080' : '3px solid #bbbbbb'}
      `
      
      const handleClick = (e) => {
        setDeleted(e)
      }

      useEffect(() => {
        const deleteImg = (e) => {
            let tmpImgs = contentImages;
            tmpImgs.splice(e.target.dataset.key, 1);
            setContentImages(tmpImgs);
            setDeleted(false)
        }
        if(deleted) deleteImg(deleted)
      }, [deleted])
    return(
        <div>
        {contentImages.length > 0 &&
        <div className={style.imgsAboveDnd}>
            {contentImages.map((img, idx) => 
                <img src={img} alt='preview' className={style.previewImg} data-key={idx} onClick={handleClick}/>
            )}
        </div>
        }
        <StyledCpnt className={style.dndBox}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            //onChange={onContentImageChange}

            // styled components props
            $isDragging={isDragging}
        >
            <div>
                <img src={close} alt='add photos' className={style.addPhotos}/>
                <p>사진을 이곳에 올려주세요</p>
            </div>
        </StyledCpnt>
        </div>
    )
}

function Write({ projectId, userInfo, isOpen, setIsOpen, existingPost, showHeader }) {

    const defaultValues = {
        contents: '',
        numOfComments: 0,
        numOfLikes: 0,
        postedAt: null,
        whoLikes: [],
        postWhere: 'project',
    }
    let [values, setValues] = useState(defaultValues)
    let [async, setAsync] = useState(false)
    let [contentImages, setContentImages] = useState([])
    let [uid, setUid] = useState("")


    useEffect(() => {
        if (existingPost) {
            setValues({
                contents: existingPost.contents,
            });
            // 만약 게시글에 이미지가 있다면 setContentImages를 사용하세요
            setContentImages(existingPost.imgUrls || []);
        }
    }, [existingPost]);

    let [selectBar, setSelectBar] = useState(false)
    let [postWhere, setPostWhere] = useState("project")

    useEffect(() => {
        if(auth.currentUser) {
        setUid(auth.currentUser.uid)
        }
    }, [])
    

    useEffect( () => {
        if(async) {
            
            addDoc(collection(dbService , "projectPosts"), values)
            setAsync(false)
        }
        else {
            setValues(defaultValues)
            setContentImages([])
        }
        // 에러 임시로 없앰
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [async])

    const handleChange = (e) => {
        setValues({
          ...values,
          [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        const imgUrls = contentImages.map(() => uuidv4());
        const postData = {
            ...defaultValues,
            ...values,
            'postedAt': moment().unix(),
            'userId': uid,
            'imgUrls': imgUrls,
            'postWhere': postWhere,
            'projectId': projectId, // projectPosts
        };
    
        const handleUploadImages = () => {
            for (let i = 0; i < contentImages.length; i++) {
                const fileRef = ref(storage, imgUrls[i]);
                uploadString(fileRef, contentImages[i], 'data_url');
            }
        };
    
        if (existingPost.postId) {
            const postRef = doc(dbService, "projectPosts", existingPost.postId);
            updateDoc(postRef, postData)
                .then(() => {
                    handleUploadImages();
                    // 업데이트 성공 시 처리
                })
                .catch(error => {
                    console.error("Error updating document: ", error);
                });
        } else {
            addDoc(collection(dbService, "projectPosts"), postData)
                .then(() => {
                    handleUploadImages();
                    // 생성 성공 시 처리
                })
                .catch(error => {
                    console.error("Error adding document: ", error);
                });

        }
    
        setIsOpen(false);
        setValues(defaultValues);
        setContentImages([]);
    };
    


    return(
        <div className={`${style.homePost} ${style.write}`}>
            {showHeader && (
                <div className={style.postHeader}>

                <div className={style.profileImg}><img src={userInfo?.profile_image || profile1Img} alt="profileImg"/></div>
                <div className={style.popModal} onClick={ () => setIsOpen(true) }>당신의 일상을 공유해주세요!</div>
                </div>
            )}
            {isOpen && (
                <div className={style.modalBG} onClick={ () => setIsOpen(false) }>
                <div onClick={ (e) => e.stopPropagation() }> {/** event 버블링 방지 */}
                    <div className={style.modalWrite}>
                        <div className={style.modalHeader}>
                            <div className={style.modalProfile} onClick={ () => setSelectBar(!selectBar) }>
                                <div className={style.profileImg}><img src={userInfo?.profile_image || profile1Img} alt="profileImg"/></div>
                                <div>
                                    <div className={style.userName}>{userName}</div>
                                </div>
                            </div>
                            {selectBar ? 
                                <div className={style.selectBar}>
                                    <div onClick={ () => {setPostWhere("profile");setSelectBar(!selectBar)} }>profile</div>
                                    <div onClick={ () => {setPostWhere("neetCompany");setSelectBar(!selectBar)} }>neetCompany</div>
                                    <div onClick={ () => {setPostWhere("project");setSelectBar(!selectBar)} }>project</div>{/*가입한 그룹이랑 연동하는것 구현필요*/}
                                </div>
                                :
                                null
                            }
                            <img src={close} alt='x' className={style.close} onClick={ () => setIsOpen(false) }/>
                        </div>
                        
                        <form onSubmit={handleSubmit} className={style.modalForm}>
                            <textarea type='text' name='contents' value={values.contents} onChange={handleChange} placeholder='나누고 싶은 생각이 있으세요?'/>
                            <DndBox contentImages={ contentImages } setContentImages={ setContentImages } />
                            <button type='submit'>게시</button>
                        </form>
                    </div>
                </div>
                </div>
            )

            
            }
            
        </div>
    )
}

function formatDate(timestamp) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
}

const ProjectHeader = ({ project, projectId }) => {
    return (
        <div className={style.projectDetail}>
          <div className={style.projectBoxDetail}>
              <div className={style.projectImageBox}>
                <img src={project.image.imageUrl} alt={project.name} />
              </div>
              <div className={style.name}>
                {project.name}
              </div>
              <div className={style.comment}>
                <div>{project.shortDescription}</div>
              </div>
          </div> 
          <div className={style.projectBoxDetail}>
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
              <div className={style.info}>
                <Link to={`/projectDetail/${projectId}`} style={{ color: 'gray', textDecoration: 'underline' }}>
                    상세보기
                </Link>
              </div>
          </div>
        </div>
      );
}

export const ProjectHome = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [users, setUsers] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [isWriteOpen, setIsWriteOpen] = useState(false);

    // get userInfo & project
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userPromise = auth.currentUser
                    ? getDoc(doc(dbService, "users", auth.currentUser.uid))
                    : Promise.resolve(null);
    
                const projectPromise = getDoc(doc(dbService, 'projects', projectId));
    
                const [userDoc, projectDoc] = await Promise.all([userPromise, projectPromise]);
    
                if (userDoc && userDoc.exists()) {
                    setUserInfo(userDoc.data());
                } else {
                    console.log("No such user document!");
                }
    
                if (projectDoc && projectDoc.exists()) {
                    setProject(projectDoc.data());
                } else {
                    console.log('프로젝트를 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error('데이터를 가져오는 동안 오류 발생:', error);
            }
        };
    
        fetchData();
    }, [projectId]);

    return(
        <div className={style.home}>
            {/* left sidebar - project info */}
            <aside className={style.leftSidebar}>
                {project? ProjectHeader({project, projectId}) : 'loading'}
            </aside>
            
            {/* Write and Posts ONLY RELATED TO PROJECT */}
            <div className={style.postsContainer}>
                <Write projectId={projectId} isOpen={isWriteOpen} setIsOpen={setIsWriteOpen} existingPost={{}} showHeader={true}/>
                <Posts projectId={projectId} userInfo={userInfo}/>
            </div>

            <aside className={style.rightSidebar}>
                RIGHT SIDEBAR
                {/* <ul className={style.interestList}>
                    {users.map(user => (
                        <li key={user.id} className={style.interestItem}>
                            <Link to={`/profiledetail?uid=${user.id}`}>
                                <img src={user.imgUrls || profile1Img} alt={user.nickname || 'User'}/>
                            </Link>
                            <span className={style.interestTitle}>{user.nickname || 'Unknown User'}</span>
                            <PlusBtn/>
                        </li>
                    ))}
                </ul> */}
            </aside>

        </div>
    )

}