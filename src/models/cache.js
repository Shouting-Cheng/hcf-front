export default {
  namespace: 'cache',

  state: {
    request: {},
    financeAudit: {},
    financePayment:{},
    financeBatch:{},
    approveRequest: {},
    financeView:{},
    overallSubList:[],
    loanAndRefund:{},
    approveExpenseReport:{},
    expenseReport:{},
    taxCodeUrlRuleId:{},
  },

  reducers: {
    setRequest(state, action) {
      let { request } = action.payload;
      return {
        ...state,
        request,
      };
    },
    setFinancePayment(state,{financePayment}){
      return {
        ...state,
        financePayment
      }
    },
    setFinanceBatch(state, {financeBatch}) {
      return {
        ...state,
        financeBatch,
      };
    },
    setApproveRequest(state, action) {
      let { approveRequest } = action.payload;
      return { ...state, approveRequest };
    },

    setFinanceAudit(state, action) {
      return { ...state, ...action.payload };
    },
    setFinanceView(state, {financeView}) {
      return {
        ...state,
        financeView,
      };
    },
    setOverallSubList(state, {overallSubList}) {
      return {
        ...state,
        overallSubList,
      };
    },
    setLoanAndRefundt(state, {loanAndRefund}) {
      return {
        ...state,
        loanAndRefund,
      };
    },
   setApproveExpenseReport(state, {approveExpenseReport}) {
      return {
        ...state,
        approveExpenseReport,
      }
   },
    setExpenseReport(state, {expenseReport}) {
      return {
        ...state,
        expenseReport,
      }
   },
    setTaxCodeUrlRuleId(state, {taxCodeUrlRuleId}) {
      return {
        ...state,
        taxCodeUrlRuleId,
      }
   },

  },
};
