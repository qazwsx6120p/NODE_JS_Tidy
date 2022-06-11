import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
//ESM 的模組管理方式(自己創建)
import { API_URL } from '../utils/config';

//------------------------------------------------------------

// 1. 在 react，我們不處理 dom 物件
// 2. 相反地，我們在 react 裡控制的是「狀態」state
// => 在 react，我們只控制狀態，然後交給 react 去幫我們處理後續
// 例如，我們乖乖地透過 setXXX 通知 react 有狀態要改變，react 收到後，
// 就會去幫我們重新渲染畫面、執行「副作用」

//---------------------------宣告狀態---------------------------------

const StockDetails = () => {
  // 宣告一個控制data的狀態
  let [data, setData] = useState([]);

  // 宣告一個控制 "目前頁數" 的狀態
  // 預設為第 1 頁
  let [page, setPage] = useState(1);

  // 總頁數 1,2,3,4,5,6,...,12
  let [lastPage, setLastPage] = useState(1);

  // App Route path="/stock/:stockId" <-有設定變數
  // 從網址上把 :stockId 這個變數拿下來
  // 可以將axios向後端發請求的網址改成串變數字串的結構
  const { stockId } = useParams();

  //------------------------------------------------------------

  // data = ['a','b','c'] <-- 不行直接改！！！
  // 當 useEffect 的第二個參數是空陣列的時候
  // 表示這是元件載入時的「副作用」

  //---------------------------後端API資料示範---------------------------------

  // 這整個是後端回覆給前端的資料 response.data
  // {
  //   "pagination": { <--頁碼資料
  //   "total": 56,
  //   "lastPage": 12,
  //   "page": "1"
  //   },
  //   "data": [
  //   {...}, <--每頁5筆
  //   {...},
  //   {...},
  //   {...},
  //   {...}
  //   ]
  // }
  //----------------------------axios--------------------------------

  // 1.原本的網址 http://localhost:3001/stocks
  // 2.將 http://localhost:3001 跟 /stocks 拆開
  // 3.在.env 宣告變數 REACT_APP_API_URL=http://locallhost:3001
  // 4.在這裡引用 process.env.REACT_APP_API_URL + '/stocks'
  // 5.引用ESM 的模組管理方式(自己創建)API_URL (config.js檔案)

  // 從後端拿資料一律使用 useEffect
  useEffect(() => {
    //使用useEffect來接收後端傳過來的資料
    let getPrices = async () => {
      let response = await axios.get(`${API_URL}/stocks/${stockId}`, {
        // http://localhost:3001/stocks/2330?page=1
        // 將網址拆分開來可以使用params:{ page : 1 }
        params: {
          // 屬性名為網址上的page，屬性值為page狀態
          // page更新一次，屬性值為page的狀態就會更新
          page: page,
        },
      });
      // 更改 data 狀態 (response.data).data
      // 整個後端回復的資料 response.data 裡面的 data
      setData(response.data.data);
      // 更改 總頁數 狀態
      setLastPage(response.data.pagination.lastPage);
    };
    getPrices(); // 呼叫函示
  }, [page]); //<--假如頁數按2  params:{page:2}

  // 初始化的時候, page 會從沒有定義變成預設值 -> 會引發這個副作用( 執行一次 useEffect 裡面的代碼 )
  // 點擊頁碼，會透過 onClick 去重新設定 page狀態  setPage(i) -> 會引發副作用
  // 副作用 -> 再執行一次 useEffect 裡面的代碼

  //-----------------------------製作頁碼-------------------------------

  //=============== 製作頁碼 ===============
  const getPages = () => {
    let pages = [];
    //用for迴圈將頁碼全部跑出來
    for (let i = 1; i <= lastPage; i++) {
      // pages.push(1); // [1]
      // pages.push(2); // [1, 2]
      // 向空陣列裡面push <li style={{...}}>{i}</li>
      pages.push(
        <li
          style={{
            display: 'inline-block',
            margin: '2px',
            // page 是我們現在在第幾頁
            // 如果page(我們現在在第幾頁)為1-12頁(i)當中的那一頁
            // 就讓這頁有顏色 '#00d1b2' 其他頁為 ''(空字串)
            backgroundColor: page === i ? '#00d1b2' : '',
            borderColor: page === i ? '#00d1b2' : '#dbdbdb',
            color: page === i ? '#fff' : '#363636',
            borderWidth: '1px',
            width: '28px',
            height: '28px',
            borderRadius: '3px',
            textAlign: 'center',
          }}
          key={i}
          // 為每一個li設定點擊事件
          onClick={(e) => {
            // 設定目前頁數為(i)
            // 設定目前的頁數為被點擊的時候<li>上面的數字
            setPage(i);
          }}
        >
          {/* 現在用for迴圈跑出來的頁碼 */}
          {i}
        </li>
      );
    }
    //回傳push完成的pages
    return pages;
  };
  //-----------------------------render-------------------------------
  return (
    <div>
      <ul>
        {/* 呼叫上面的頁碼函數，讓他渲染出來 */}
        {getPages()}
      </ul>
      {data.map((item) => {
        return (
          <div
            key={item.date}
            className="bg-white bg-gray-50 p-6 rounded-lg shadow m-6"
          >
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              日期： {item.date}
            </h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              成交金額：{item.amount}
            </h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              成交股數：{item.volume}
            </h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              開盤價：{item.open_price}
            </h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              收盤價：{item.close_price}
            </h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              漲跌價差：{item.delta_price}
            </h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              最高價：{item.high_price}
            </h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              最低價：{item.low_price}
            </h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              成交筆數：{item.transactions}
            </h2>
          </div>
        );
      })}
    </div>
  );
};

export default StockDetails;
