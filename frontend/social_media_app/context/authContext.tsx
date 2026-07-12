import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type UserData from '../interfaces/userInterface.ts'
import { apiRequest } from "../lib/apiRequest.ts";

interface AuthContextType {
    user: UserData | null;
    setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
    const context = useContext(AuthContext);

    if(!context)
        return null

    return context;
}

function AuthContextProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        apiRequest.get('/auth/islogin')
        .then((res) => {
            if(res.status === 200){
                setUser(res.data.user)
            }
        })
        .catch((error) => console.log(error.response.data));
    }, [])

    console.log(user)

    

    return (
        <AuthContext.Provider value={{user, setUser}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider;





