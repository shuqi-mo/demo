// 编写store
import { createSlice } from "@reduxjs/toolkit"
import axios from "axios"

const stockStore = createSlice({
    name: 'stock',
    initialState: {
        // 股票列表
        stockList: [],
        // 刷选区域
        brushArea: [],
    },
    reducers: {
        // 更改股票列表
        setStockList(state, action) {
            state.stockList = action.payload
        },
        // 更新刷选区域
        setBrushArea(state, action) {
            state.brushArea = action.payload
        },
    }
})

// 异步获取部分
const { setStockList, setBrushArea } = stockStore.actions
const fetchStockList = () => {
    return async (dispatch) => {
        // 编写异步逻辑
        const res = await axios.get('http://localhost:3004/AAPL')
        // 调用dispatch函数提交action
        dispatch(setStockList(res.data))
    }
}

const fetchBrushArea = () => {
    return async (dispatch) => {
        dispatch(setBrushArea([4458,4462]))
    }
}

export { fetchStockList, setBrushArea, fetchBrushArea }

const reducer = stockStore.reducer

export default reducer