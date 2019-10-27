const users = []

const addUser = (id,username = '',room = '') => {
    // clean data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    // validate
    if(!username || !room){
        return {
            error : 'username and password are required!!'
        }
    }
    let existingUser = users.find(user => user.username == username && user.room == room )
    // validate
    if(existingUser){
        return {
            error : 'username already exists in the room'
        }
    }
    let user = {id,username,room}
    users.push(user);
    return {user}
}

const removeUser = (id) => {
    let index = users.findIndex( (user) => user.id == id)
    return users.splice(index,1)[0];
}

const getUser = (id) => users.find((user)=> user.id == id)

const getUsersInRoom = (room) => users.filter((user)=> user.room == room)
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}