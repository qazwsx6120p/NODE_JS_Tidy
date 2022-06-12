// export/import => ESM 的模組管理方式
// 設定預設值
// 用API_URL變數 = process.env.REACT_APP_API_URL+"/api" 如果找不到就預設 "http://localhost:3001/api"
export const API_URL=process.env.REACT_APP_API_URL+"/api" || "http://localhost:3001/api";