export default {
  print: (value, callback) => {
    console.log(value);
    callback(true);
  },
  test: value => {
    console.log('test');
    window.instances['table'].search();
  },
  change: value => {
    console.log(value);
    // window.instances['table'].search();
  },
};
