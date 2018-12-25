/**
 * Created by zhouli on 18/4/25
 * Email li.zhou@huilianyi.com
 */
//根据角色后端过滤后的部门树
//单选与多选
//这个业务组件功能单一，使用简单

//要求后端接口，必须根据角色返回如下格式数据：
//否则无法展示部门树

// [
//   {
//     "name": "",
//     "childrenDepartment":[],
//     "departmentOid":""
//   },
//   {
//     "name": "",
//     "childrenDepartment":[
//       {
//         "name": "",
//         "childrenDepartment":[],
//         "departmentOid":""
//       },
//     ],
//     "departmentOid":""
//   },
// ]

//有一点注意：为了适应不同角色，需要掉不同的接口
//所以使用组件的时候，配置一下所写api对应的key值
