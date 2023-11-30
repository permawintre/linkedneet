import { ShowPosts, RightSideBar } from "../Home/Home"
import "./NeetCompany.css"
import { useState, useEffect } from 'react'
import { dbService, auth } from "../firebase"
import moment from 'moment'
import { doc, getDoc, collection, getDocs } from "firebase/firestore"

export const whoCheckedF = async (targetDate) => {

    let ans = [];
    const dayStart = targetDate - targetDate%86400;
    const dayEnd = dayStart+86400;
    const check = (element) => {
        if(dayStart<=element && element<dayEnd) return true;
        else return false;
    }
    const querySnapshot = await getDocs(collection(dbService, "neetCompany"));
    querySnapshot.forEach((doc) => {
        if(doc.data().checkTimes.findIndex(check)>=0){
            ans.push(doc.id);
        }
    });
    return ans;
}

export const NeetCompany = () => {

    const [uid, setUid] = useState(false);
    const [checked, setChecked] = useState(false);
    const [ncCheckTimes, setNcCheckTimes] = useState([]);
    const [whoChecked, setWhoChecked] = useState([]);
    useEffect(() => {
        setUid(auth.currentUser.uid)
        const tmpfnc = async () => {
            const newWhoChecked = await whoCheckedF(moment().unix())
            setWhoChecked(newWhoChecked)
        }
        tmpfnc()
    }, [])
    useEffect(() => {
        
        const getNcCheckTimes = async () => {
            if(uid) {
                const ncDocRef = doc(dbService, "neetCompany", uid)
                const docSnap = await getDoc(ncDocRef);
                if (docSnap.exists()) {
                    setNcCheckTimes(docSnap.data().checkTimes)
                    console.log("Document data:", docSnap.data().checkTimes);
                } else {
                    console.log("No such document!");
                }

            }
        }
        getNcCheckTimes();
    }, [uid])
    useEffect(() => {

        if(ncCheckTimes.length===0) return;
        let tmp = ncCheckTimes
        const now = moment().unix();
        const todayStart = now - now%86400;
        const todayEnd = todayStart+86400;
        const check = (element) => {
            if(todayStart<=element && element<todayEnd) return true;
            else return false;
        }
        if(tmp.findIndex(check)>=0) {
            setChecked(true)
        }
    }, [ncCheckTimes])
    return(
        <div className="neetCompanyBody">
            <aside className="left-sidebar-neet">
                <img src="image_url_here" alt="Landscape" className="card-image"/>
                <div className="card-content">
                <div className="card-title">다른 기사</div>
                <div className="card-number">161</div>
                <div className="card-date">2023.10.03. 37일전</div>
                <div className="card-status">
                    <span className="status-dot"></span>
                    <span className="status-text">현재 출근한 멤버</span>
                </div>
                <div className="card-members">21명</div>
                </div>
            </aside>

            <div className="homePostsMarginControl">
                
                <div>
                    {checked ? "출근함" : "출근안함"}
                </div>
                <div>
                    {'오늘 출근한 사람 수: '}{whoChecked.length}
                </div>
                <ShowPosts currentLocation={'neetCompany'}/>
            </div>
            <RightSideBar/>
        </div>
    )
}