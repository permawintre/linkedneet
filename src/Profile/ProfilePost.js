import React, { useRef, useState, useEffect } from 'react';
import { dbService, auth } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { storage } from '../firebase.js';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import './ProfilePost.css';
import { ShowPosts } from '../Home/Home'

const ProfilePost = ({userData, myProfile}) => {
    const [postList, setPostList] = useState([]);
    
    const profileUid = userData.uid
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
                    {postList.length === 0 ? (
                      <div className="no-posts-message">
                          아직 게시글이 없어요 T^T
                      </div>
                    ) : (
                        // postList.map(post => (
                        //     // <div className="profile-post" key={post.id}>
                        //         {/* <div className='post-header'>
                        //             <img src={post.userProfile} alt="User Profile" className="user-profile-img" />
                        //             <div className='post-info'>
                        //                 <div className='profile-post-nickname'>{post.nickname}</div>
                        //                 <div className='profile-post-posted-time' data-tooltip={(new Date(post.postedAt*1000)).toLocaleString()}>{formatDistanceToNow(new Date(post.postedAt*1000), { addSuffix: true, locale: ko })}</div>
                        //             </div>
                        //         </div> */}
                        //         {/* <div className='text'>{post.contents}</div> */}
                        //         {/* {post.images && post.images.length > 0 && <PostPics imgs={post.images} />} */}
                        //     // </div>
                        // ))
                        <ShowPosts currentLocation={'profile'}/>
                      )}
                </div>
            </main>
        </div>
    );
  };

export { ProfilePost }