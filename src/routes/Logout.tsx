import { LogOut } from "lucide-react";
import { clearAuthData } from "../utils/tokenStorage";
import { useNavigate } from "react-router-dom";

export default function LogoutButton(){
    const navigate = useNavigate();
    const handleLogout=()=>{
    clearAuthData();
    navigate("/");
}
    return(
        <button onClick= {handleLogout}
        className="flex items-center gap-3 px-4 py-3 mt-6 text-red-600 hover:bg-red-50 rounded-xl"
    >
        <LogOut size={20} />Logout
    </button>
    )
}