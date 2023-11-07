import './ProfileEdit.css'
import  { useState } from 'react'
import { dbService } from '../firebase'
import { collection, addDoc } from "firebase/firestore"

export const ProfileHeaderEdit = (props) => {
    
    // Define USER TABLE (need to add more)
    const [userObj, setUserObj] = useState ({
        nickname: "",
        website: "",
        instagram:"",
        facebook:"",
        tel:"",
        e_mail:"",
    });

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
        await addDoc(collection(dbService, "users"), {
            data: userObj,
            user_id: props.userid.uid,
        });
        //setUserObj(null);
    };
    // const q = query(collection(db, "posts"), where("uid", "==", "etc"))로 쿼리 ㄴ
    // https://velog.io/@khy226/Firestore-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0 참고

    return (
        <div className="body">
            <form onSubmit={onSubmit}>
                <hr className="body__partition"></hr>
                <div className="body_inner">
                    <p className="body__inputline--description"> 닉네임 </p>
                    <div className="body_input"> 
                        <input className="body__inputline--input" name="nickname" type="text" value = {userObj.nickname} placeholder="닉네임을 입력해 주세요" onChange={onChange} />
                    </div>

                    <p className="body__inputline--description"> 개인 웹사이트 </p>
                    <div className="body_input"> 
                        <input className="body__inputline--input" name="website" type="text" value = {userObj.website} placeholder="notion github tistory" onChange={onChange}/>
                    </div>

                    <p className="body__inputline--description"> SNS </p>
                    <div className="body_input"> 
                        <input className="body__inputline--input" name="instagram" type="text" value = {userObj.instagram} placeholder="@instagram" onChange={onChange} />
                    </div>
                    <div className="body_input">
                        <input className="body__inputline--input" name="facebook" type="text" value = {userObj.facebook} placeholder="@facebook" onChange={onChange} />
                    </div>

                    <p className="body__inputline--description"> Tel </p>
                    <div className="body_input"> 
                        <input className="body__inputline--input" name="tel" type="text" value = {userObj.tel} placeholder="@010-xxxx-xxxx" onChange={onChange} />
                    </div>
                    <div className="body_input">
                        <input className="body__inputline--input" name="e_mail" type="text" value = {userObj.e_mail} placeholder="linkedneet@gmail.com" onChange={onChange} />
                    </div>

                    <button type="submit" className="body__submitbtn">수정</button>
                    <hr className="body__partition"></hr>
                </div>
            </form>
        </div>
    )
}