import React, { useRef, useState, useEffect } from 'react';
import { dbService, auth } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc, query, where, getDocs, orderBy, deleteDoc, limit, startAfter } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { storage } from '../firebase.js';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import './ProfilePost.css';
import { Write, Post } from '../Home/Home'

const Posts=({ userInfo, profileUid, onHasPostsChange }) =>{
    const [posts, setPosts] = useState([]);
    const [lastKey, setLastKey] = useState(0);
    const [nextPosts_loading, setNextPostsLoading] = useState(false);

    const setQuery = () => {
        return query(
            collection(dbService, 'posts'),
            where("userId", "==", profileUid),
            orderBy("postedAt", "desc"),
            limit(5)
        )
    }
    const setQueryMore = (key) => {
        return query(
            collection(dbService, 'posts'),
            where("userId", "==", profileUid),
            orderBy("postedAt", "desc"),
            startAfter(key),
            limit(1)
        )
    }

    const initFetch = async () => {
        
        try {
            let posts = [];
            let lastKey = '';
            const q = setQuery();
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

    const moreFetch = async (key) => {
        try {
            let posts = [];
            let lastKey = '';
            const q = setQueryMore(key);
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
                onHasPostsChange(res.posts.length > 0);
            })
            .catch((err) => {
                console.log(err);
                onHasPostsChange(false);
            });
    }, [])
    const fetchMorePosts = (key) => {
        //console.log(key)
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
                    modified = {post.modified}
                    projectId = {post.projectId}
                />
                <div className='postFooter'>
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
        <div className="addmargin-in-profile" style={{ textAlign: "center" }}>
            {nextPosts_loading ? (
                <p>Loading..</p>
            ) : (
                <span>You are up to date!</span>
            )}
        </div>
    </div>
    );
}

const ProfilePost = ({ currentUserData, userData, myProfile}) => {
    const [hasPosts, setHasPosts] = useState(true);
    const [isWriteOpen, setIsWriteOpen] = useState(false);
    
    const handleHasPostsChange = (hasPosts) => {
        setHasPosts(hasPosts);
    };

    const profileUid = userData.uid

    return (
        <div className="container-post">
            <main className='profile-post-main'>
                <h2>게시글</h2>
                <div className="profile-post-list">
                    {!hasPosts ? (
                        <div className="no-posts-message">
                            아직 게시글이 없습니다
                        </div>
                    ) : (
                        <div className="real-posts"> { myProfile ? (
                            <div className='postsContainer'>
                                <Write isOpen={isWriteOpen} setIsOpen={setIsWriteOpen} existingPost={false} showHeader={true} currentLocation="profile"/>
                                <Posts userInfo={currentUserData} profileUid={profileUid} onHasPostsChange={handleHasPostsChange}/>
                            </div>
                            ) : (
                            <Posts userInfo={currentUserData} profileUid={profileUid} onHasPostsChange={handleHasPostsChange}/>
                            )}                            
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
  };

export { ProfilePost }