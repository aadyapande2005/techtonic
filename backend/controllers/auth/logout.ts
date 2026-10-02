export const logout = async (req, res) => {
    try {        
        res
        .status(200)
        .clearCookie('accessToken')
        .json({message : 'logout successful'});
    } catch (error) {
        res
        .status(500)
        .json({message : 'Error while logging out...'})
    }  
}