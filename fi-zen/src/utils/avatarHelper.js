// Avatar helper to handle dynamic avatar loading
const avatars = {
  1: require('../../assets/avatars/avatar-1.png'),
  2: require('../../assets/avatars/avatar-2.png'),
  3: require('../../assets/avatars/avatar-3.png'),
  4: require('../../assets/avatars/avatar-4.png'),
  5: require('../../assets/avatars/avatar-5.png'),
  6: require('../../assets/avatars/avatar-6.png'),
  7: require('../../assets/avatars/avatar-7.png'),
  8: require('../../assets/avatars/avatar-8.png'),
  9: require('../../assets/avatars/avatar-9.png'),
  10: require('../../assets/avatars/avatar-10.png'),
  11: require('../../assets/avatars/avatar-11.png'),
  12: require('../../assets/avatars/avatar-12.png'),
  13: require('../../assets/avatars/avatar-13.png'),
  14: require('../../assets/avatars/avatar-14.png'),
  15: require('../../assets/avatars/avatar-15.png'),
  16: require('../../assets/avatars/avatar-16.png'),
  17: require('../../assets/avatars/avatar-17.png'),
  18: require('../../assets/avatars/avatar-18.png'),
};

export const getAvatarSource = (avatarNumber) => {
  return avatars[avatarNumber] || avatars[1];
};

export default avatars;