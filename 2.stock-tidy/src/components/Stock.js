import { Link } from 'react-router-dom';
//引入react的axios
import axios from 'axios';
import { useState, useEffect } from 'react';
//ESM 的模組管理方式(自己創建)
import { API_URL } from '../utils/config';

//------------------------------------------------------------

const Stock = () => {
  // 拿到的資料為陣列
  // useState 預設值給他空陣列[]
  const [stocks, setStocks] = useState([]);

  // 1.原本的網址 http://localhost:3001/stocks
  // 2.將 http://localhost:3001 跟 /stocks 拆開
  // 3.在.env 宣告變數 REACT_APP_API_URL=http://locallhost:3001
  // 4.在這裡引用 process.env.REACT_APP_API_URL + '/stocks'
  // 5.引用ESM 的模組管理方式(自己創建)API_URL (config.js檔案)

  useEffect(() => {
    // 設定一個async函數來接收資料
    let getStocks = async () => {
      // 取得 http://localhost:3001/stocks API
      let response = await axios.get(`${API_URL}/stocks`);

      // 將response的資料更新回stocks的狀態內
      setStocks(response.data);
    };
    // 呼叫函數
    getStocks();
  }, []); // <--如果為空陣列只會在第一次傳入時執行以上代碼

  return (
    <div>
      <h2 className="ml-7 mt-6 text-xl text-gray-600">股票代碼</h2>

      {stocks.map((stock) => {
        return (
          <div key={stock.id} className="bg-white bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg m-6 cursor-pointer">
            {/* 使用模版字符串加上${ 股票編號 }*/}
            <Link to={`/stock/${stock.id}`}>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                {/* 套用stocks用map跑出來的所有id */}
                {stock.id}
              </h2>
              {/* 套用stocks用map跑出來的所有name */}
              <p className="text-gray-700">{stock.name}</p>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default Stock;
