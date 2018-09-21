export default {
  print: value => {
    console.log('hello');
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
