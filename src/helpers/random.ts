const random = {
  float: () => Math.random(),
  int: (min = 1, max = 100) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};

export default random;
