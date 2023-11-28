import './ProfileEdit.css'
import  { useState, useEffect } from 'react'
import { dbService, auth } from '../firebase'
import { updateDoc, getDoc, doc } from "firebase/firestore"


export const ProfileHeaderEdit = () => {
    
    // user Table Attribute (need to add more)
    const [userObj, setUserObj] = useState ({
        nickname: "",
        website: "",
        instagram:"",
        facebook:"",
        tel:"",
        email:"",
    });
    
    // 유저가 처음으로 profile edit page에 들어가면 자기 profile fetch 시킴
    useEffect(() => {
        const fetchUserData = async (uid) => {
            try {
                // get [one and only one] docReference using key
                const userDocRef = doc(dbService, 'users', auth.currentUser.uid);
                const userDoc = await getDoc(userDocRef);

                // If the document exists, setUserData with the document data
                if (userDoc.exists()) {
                    setUserObj(userDoc.data());
                } else {
                    console.log('User not found');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    // User Input {OnChange}
    const onChange = (e) => {
        const { name, value } = e.target;
        setUserObj((prevUserObj) => ({
          ...prevUserObj,
          [name]: value,
        }));
      };

    // User Click Submit => Then Create a new data and store to "users" table.
    // See Query and Update for below. This is only about "CREATING" new data.
    const onSubmit = async(event) => {
        event.preventDefault();
        const userDocRef = doc(dbService, 'users', auth.currentUser.uid);
        try {

            // update DB using user input 
            const res = await updateDoc(userDocRef, {
                nickname: userObj.nickname,
                website: userObj.website,
                instagram: userObj.instagram,
                facebook: userObj.facebook,
                tel: userObj.tel,
                email: userObj.email,
            })

            // if successfully edit, then refresh < 새로고침 > 
            window.location.reload();
        } catch (e) {
            console.log(e);
        }
        //setUserObj(null);
    };
    // const q = query(collection(db, "users"), where("uid", "==", "etc"))로 쿼리
    // https://velog.io/@khy226/Firestore-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0 참고


    return (
        <div className="body">
            <form onSubmit={onSubmit}>
                <hr className="body__partition"></hr>
                <div className="body_inner">
                    <p className="body__inputline--description"> 닉네임 </p>
                    <div className="body_input"> 
                        <input className="body__inputline--input" name="nickname" type="text" value = {userObj.nickname || ""} placeholder="닉네임을 입력해 주세요" onChange={onChange} />
                    </div>

                    <p className="body__inputline--description"> 개인 웹사이트 </p>
                    <div className="body_input"> 
                        <input className="body__inputline--input" name="website" type="text" value = {userObj.website || ""} placeholder="notion github tistory" onChange={onChange}/>
                    </div>

                    <p className="body__inputline--description"> SNS </p>
                    <div className="body_input"> 
                        <input className="body__inputline--input" name="instagram" type="text" value = {userObj.instagram || ""} placeholder="@instagram" onChange={onChange} />
                    </div>
                    <div className="body_input">
                        <input className="body__inputline--input" name="facebook" type="text" value = {userObj.facebook || "" } placeholder="@facebook" onChange={onChange} />
                    </div>

                    <p className="body__inputline--description"> Tel </p>
                    <div className="body_input"> 
                        <input className="body__inputline--input" name="tel" type="text" value = {userObj.tel || ""} placeholder="@010-xxxx-xxxx" onChange={onChange} />
                    </div>
                    <div className="body_input">
                        <input className="body__inputline--input" name="email" type="text" value = {userObj.email || ""} placeholder="linkedneet@gmail.com" onChange={onChange} />
                    </div>

                    <button type="submit" className="body__submitbtn">수정</button>
                    <hr className="body__partition"></hr>
                </div>
            </form>
        </div>
    )
}

export const ProfileDetailEdit = (props) => {
    return (
        <h1> Not implemented </h1>
    )
}