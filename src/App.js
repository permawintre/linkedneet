import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from "react-router-dom"
import './App.css'
import { auth, dbService} from './firebase.js'
import { doc, getDocs, collection, query, where, getDoc  } from "firebase/firestore"
import { Header } from "./Header.js"
import { Home } from "./Home/Home.js"
import { Signup, Login, GoogleSignup, Google } from "./Auth/Auth.js"
import { NotFound } from "./etc/Notfound.js"
import { Approve } from "./Admin/Approve.js"
import { NeetCompany } from "./Neetcompany/NeetCompany.js"
import { Profile } from "./Profile/Profile.js"
import ProfileDetail from './Profile/ProfileDetail.js'
import { ProfileHeaderEdit } from './Profile/ProfileEdit.js'

import { Project } from "./ProjectPage/Project.js"
import { ProjectDetail } from './ProjectPage/ProjectDetail.js'
import { ProjectCreate } from './ProjectPage/ProjectCreate.js'
import { ProjectJoin } from './ProjectPage/ProjectJoin.js'
import { ProjectManage } from './ProjectPage/ProjectManage.js'
import { ProjectHome } from './ProjectPage/ProjectHome.js'

import ProfileCareerDetail from './Profile/ProfileCareerDetail.js'

import { EnrollManage } from './Manage/EnrollManage.js'

function App() {

    const [init, setInit] = useState(true); 
    const navigate = useNavigate();
    // 처음에는 false이고 나중에 사용자 존재 판명이 모두 끝났을 때 true를 통해 해당 화면을 render
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [authObj, setAuthObj] = useState(null);
    const [userLevel, setUserLevel] = useState(0);

    useEffect((async) => {
      auth.onAuthStateChanged((user) => { // user 판명을 듣고 
        if(user) { // 있으면
          setIsLoggedIn(true); // 로그인 됨

          // 유저 DB에 uid가 제대로 있는지 체크. 없으면 다른 화면 못보게 하기
          const userRef = collection(dbService, "users");
          const userQuery = query(userRef, where("uid", "==", auth.currentUser.uid));
          getDocs(userQuery).then((userQuerySnapshot) => {
            if (userQuerySnapshot.empty) {
              // User not exists 
              setInit(false);
            }
          });

          const userDocRef = doc(dbService, 'users', auth.currentUser.uid);
          getDoc(userDocRef).then((userQuerySnapshot) => {
            if (userQuerySnapshot.exists()) {
              const userData = userQuerySnapshot.data();
              setUserLevel(userData.level);
            } else {
              // User does not exist
              setInit(false);
            }
          }).catch((error) => {
            console.error('Error getting user document:', error);
          });

        } else {
          setIsLoggedIn(false); // 로그인 안됨
        }
        //setInit(true); // user 판명 끝
      });
    }, [])

    let loggedIn  = init && isLoggedIn;
    let approved = userLevel;

    const RedirectToLogIn = () => {
      navigate("/logIn");
    }
    console.log(userLevel);

  return(
    <div className="background">
        <Header/>
        <Routes>
            <Route path="/approve" element={ approved ? <Home /> : <Approve/>} />
            <Route path="/" element={loggedIn ? (approved ? <Home/> : <Approve />) : <RedirectToLogIn/>}></Route>
            <Route path="/project" element={loggedIn ? (approved ? <Project/> : <Approve />) : <RedirectToLogIn/>}></Route>
            <Route path="/projectdetail/:projectId" element={loggedIn ?  (approved ? <ProjectDetail/> : <Approve />) : <RedirectToLogIn/>}></Route>
            <Route path="/projectjoin/:projectId" element={loggedIn ? (approved ? <ProjectJoin/> : <Approve />) : <RedirectToLogIn/>}></Route>
            <Route path="/projectcreate" element={loggedIn ? (approved ? <ProjectCreate/> : <Approve />) :<RedirectToLogIn/>}></Route>
            <Route path="/projectmanage/:projectId" element={loggedIn ? (approved ? <ProjectManage/>: <Approve />) : <RedirectToLogIn/>}></Route>
            <Route path="/projecthome/:projectId" element={loggedIn ? (approved ? <ProjectHome/>: <Approve />) : <RedirectToLogIn/>}></Route>
            
            <Route path="/neetCompany/:neetGeneration" element={loggedIn ? (approved ?<NeetCompany/>: <Approve />) : <RedirectToLogIn/>}></Route>
            <Route path="/profile" element={loggedIn ? (approved ? <Profile/> : <Approve />) : <RedirectToLogIn/>}></Route>
            <Route path="/profiledetail" element={loggedIn ? (approved ? <ProfileDetail/> : <Approve />) : <RedirectToLogIn/>}></Route>
            <Route path="/profiledetail/career" element={<ProfileCareerDetail/>}></Route>

            <Route path="/profileheaderedit" element={loggedIn ? <ProfileHeaderEdit authObj = {authObj}/> : <RedirectToLogIn/>}></Route>

            <Route path="/manage" element={<EnrollManage/>}></Route>

            <Route path="/google_signup" element={isLoggedIn ? <GoogleSignup/> : <RedirectToLogIn/>}></Route>
            <Route path="/approve" element={<Approve/>}></Route>
            <Route path="/signUp" element={<Signup/>}></Route>
            <Route path="/logIn" element={<Login/>}></Route>
            <Route path="*" element={<NotFound/>}></Route>
        </Routes>
    </div>

  )
}

export default App;