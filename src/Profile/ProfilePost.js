import React, { useRef, useState, useEffect } from 'react';
import { dbService, auth } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { storage } from '../firebase.js';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import arrow from '../images/arrow.png'
import './ProfilePost.css';
import {getDayMinuteCounter} from '../Home/supportFunctions'
/**
 * 함수형 컴포넌트로, 이미지 배열 넣으면 좌우 슬라이드 가능한 component로 반환합니다(550px * 550px)
 * @param {Array} 사진으로 구성된 배열 input 
 * @returns className 'postPic'인 div로 둘러싸인 컴포넌트 반환
 */
const PostPics = ({imgs}) => {

    /* 리스너 설치하기 */
    //console.log({imgs})
    let [idx, setIdx] = useState(0); // 슬라이드 현재 번호
    let [moveX, setMoveX] = useState(0); // 슬라이드 위치 값
    const imgsLength = JSON.parse(JSON.stringify({imgs})).imgs.length
  
    function moveL() {
      if(idx === 0) console.log('cannot move')
      else {
        setIdx(idx-1)
        setMoveX(moveX+550)
      }
    }
    function moveR() {
      if(idx === imgsLength-1) console.log('cannot move')
      else {
        setIdx(idx+1)
        setMoveX(moveX-550)
      }
    }
  
    return(
      <div className='profile-postPic'>
        <div className='imgContainer' style={{width: `${imgsLength*550}px`}}>
          {/** map 활용해서 배열안에있던 이미지 하나씩 표시 */}
          {imgs.map((img, idxs) => (<img src={img} alt="postPic" key={idxs} style={{transform : `translateX(${moveX}px)`}}/>))}
        </div>
        <div className='btnContainer'>
          {/** 더이상 넘길 곳 없으면 버튼 사라지도록 삼항연산자로 처리 */}
          {idx === 0?
            <div className='placeHolder'/>
            :
            <div className='prev' onClick={moveL}><img src={arrow} alt="prev" /></div>
          }
          {idx === imgsLength-1?
            <div className='placeHolder'/>
            :
            <div className='next' onClick={moveR}><img src={arrow} alt="next" /></div>
          }
          
        </div>
      </div>
    )
  }

const ProfilePost = ({userData, myProfile, profileUid}) => {
    const [postList, setPostList] = useState([]);
  
   // Firebase에서 Post 불러오기 (Fetch)
   useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = query(collection(dbService, "posts"), where("userId", "==", profileUid));
                const querySnapshot = await getDocs(q);
                const postPromises = querySnapshot.docs.map(async (_doc) => {
                    const postData = _doc.data();
                    // 사용자 정보 가져오기
                    const userRef = doc(dbService, "users", postData.userId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        postData.userProfile = userSnap.data().profile_image;
                        postData.nickname = userSnap.data().nickname;
                    }
                    // 이미지 URL 변환
                    postData.images = await Promise.all(postData.imgUrls.map(imgUrl => 
                        getDownloadURL(ref(storage, imgUrl))
                    ));
                    return { id: _doc.id, ...postData };
                });
                const posts = await Promise.all(postPromises);
                posts.sort((a, b) => b.postedAt - a.postedAt);
                setPostList(posts);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };
        fetchPosts();
    }, [profileUid]);

    return (
        <div className="container">
            <main className='profile-post-main'>
                <h2>게시글</h2>
                <div className="profile-post-list">
                    {postList.map(post => (
                        <div className="profile-post" key={post.id}>
                            <div className='post-header'>
                                <img src={post.userProfile} alt="User Profile" className="user-profile-img" />
                                <div className='post-info'>
                                    <div className='profile-post-nickname'>{post.nickname}</div>
                                    <div className='profile-post-posted-time' data-tooltip={(new Date(post.postedAt*1000)).toLocaleString()}>{formatDistanceToNow(new Date(post.postedAt*1000), { addSuffix: true, locale: ko })}</div>
                                </div>
                            </div>
                            <div className='text'>{post.contents}</div>
                            {post.images && post.images.length > 0 && <PostPics imgs={post.images} />}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
  };

export { ProfilePost }