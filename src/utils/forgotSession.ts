export const FORGOT_EMAIL_KEY = "forgotEmail";
export const setForgotEmail = (email: string)=>{
    sessionStorage.setItem(FORGOT_EMAIL_KEY, email);
};
export const getForgotEmail = () : string | null =>{
    return sessionStorage.getItem(FORGOT_EMAIL_KEY);
};
export const clearForgotEmail = () =>{
    sessionStorage.removeItem(FORGOT_EMAIL_KEY);
}