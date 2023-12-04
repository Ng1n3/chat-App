const users = [];

//addUser, removeUser, getUser, getusersInRoom

const addUser = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data
  if (!username || !room) {
    return {
      error: "Username and room required!",
    };
  }

  // check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: "Useranme is in use!, please choose another username",
    };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  if (!user) {
    return {
      error: "User not found",
    };
  }
  return user;
};

const getusersInRoom = (roomname) => {
  roomname = roomname.trim().toLowerCase();
  const usersInRoom = users.filter((user) => user.room === roomname);
  if (!usersInRoom) {
    return {
      error: "room not found",
    };
  }
  return usersInRoom;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getusersInRoom,
};

// const res = addUser({
// console.log(getUser(24))
//   id: 33,
//   username: 'Emmanuel',
//   room: 'nigeria'
// })
// console.log(res);
// const removedUser = removeUser(22)
// console.log(removedUser)
// console.log(users)
// addUser({
//   id: 22,
//   username: 'Emmanuel',
//   room: 'nigeria'
// })

// addUser({
//   id: 24,
//   username: 'Muyiwa',
//   room: 'nigeria'
// })

// addUser({
//   id: 25,
//   username: 'Jese',
//   room: 'south sudan'
// })
// console.log(getusersInRoom('NiGeria'));
// console.log(getusersInRoom('SoUth SudAn'));
// console.log(getUser(22));

