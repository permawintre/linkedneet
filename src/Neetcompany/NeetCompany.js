import { ShowPosts } from "../Home/Home"
import "./NeetCompany.css"

export const NeetCompany = () => {

    return(
        <div className="neetCompanyBody">
            <ShowPosts currentLocation={'neetCompany'}/>
        </div>
    )
}