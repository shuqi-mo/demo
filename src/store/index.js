import stockStore from './modules/stock'
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({
  reducer: {
    stock: stockStore
  }
})

export default store