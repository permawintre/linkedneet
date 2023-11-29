import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from "react-router-dom"
import './App.css'
import { auth, dbService} from './firebase.js'
import { doc, getDocs, collection, query, where  } from "firebase/firestore"
import { Header } from "./Header.js"
import { Home } from "./Home/Home.js"
import { Signup, Login, GoogleSignup, Google } from "./Auth/Auth.js"
import { NotFound } from "./etc/Notfound.js"
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

function App() {

    const [init, setInit] = useState(true); 
    const navigate = useNavigate();
    // 처음에는 false이고 나중에 사용자 존재 판명이 모두 끝났을 때 true를 통해 해당 화면을 render
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [authObj, setAuthObj] = useState(null);
    useEffect(() => {
      auth.onAuthStateChanged((user) => { // user 판명을 듣고 
        if(user) { // 있으면
          setIsLoggedIn(true); // 로그인 됨
          const userRef = collection(dbService, "users");
          const userQuery = query(userRef, where("uid", "==", auth.currentUser.uid));
          getDocs(userQuery).then((userQuerySnapshot) => {
            if (userQuerySnapshot.empty) {
              // User not exists 
              setInit(false);
            }
          });
        } else {
          setIsLoggedIn(false); // 로그인 안됨
        }
        //setInit(true); // user 판명 끝
      });
    }, [])

    let loggedIn = init && isLoggedIn;

    const RedirectToLogIn = () => {
        navigate("/logIn");
    }

  return(
    <div className="background">
        <Header/>
        <Routes>
            <Route path="/" element={loggedIn ? <Home/> : <RedirectToLogIn/>}></Route>
            <Route path="/project" element={loggedIn ? <Project/> : <RedirectToLogIn/>}></Route>
            <Route path="/projectdetail/:projectId" element={loggedIn ? <ProjectDetail/> : <RedirectToLogIn/>}></Route>
            <Route path="/projectjoin/:projectId" element={loggedIn ? <ProjectJoin/> : <RedirectToLogIn/>}></Route>
            <Route path="/projectcreate" element={loggedIn ? <ProjectCreate/> : <RedirectToLogIn/>}></Route>
            <Route path="/projectmanage/:projectId" element={loggedIn ? <ProjectManage/>: <RedirectToLogIn/>}></Route>
            <Route path="/projecthome/:projectId" element={loggedIn ? <ProjectHome/>: <RedirectToLogIn/>}></Route>

            <Route path="/neetCompany" element={loggedIn ? <NeetCompany/> : <RedirectToLogIn/>}></Route>
            <Route path="/profile" element={loggedIn ? <Profile/> : <RedirectToLogIn/>}></Route>
            <Route path="/profiledetail" element={loggedIn ? <ProfileDetail/> : <RedirectToLogIn/>}></Route>
            <Route path="/profiledetail/career" element={<ProfileCareerDetail/>}></Route>

            <Route path="/profileheaderedit" element={loggedIn ? <ProfileHeaderEdit authObj = {authObj}/> : <RedirectToLogIn/>}></Route>

            <Route path="/google_signup" element={isLoggedIn ? <GoogleSignup/> : <RedirectToLogIn/>}></Route>
            <Route path="/signUp" element={<Signup/>}></Route>
            <Route path="/logIn" element={<Login/>}></Route>
            <Route path="*" element={<NotFound/>}></Route>
        </Routes>
    </div>

  )
}

export default App;