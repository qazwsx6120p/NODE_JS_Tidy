
const express = require('express');
//const app = express();
const router = express.Router();
// router is a mini-app

//-------------------------** createPoolRequire **----------------------------

//下面會使用到 pool 所以require pool
let pool = require('../utils/1.db');

//-------------------------** 取得 stocks 的列表 **----------------------------

// RESTful API
// 網址使用/stocks
router.get('/', async (req, res, next) => {
    // 展開陣列( 裡面會有兩個資料 data 跟 fields )
    // execute()用來執行SQL語法的方法
    // pool.execute('SELECT * FROM stocks')
    // 用sql語法
    let [data, fields] = await pool.execute('SELECT * FROM stocks');
  
    //回復json格式的data
    res.json(data);
  });
  
  // ----------------------------------** 取得某個股票 id 的資料 **---------------------------------------
  
  router.get('/:stockId', async (req, res, next) => {
    // 取得網址上的參數 req.params
    // req.params.stockId
    console.log('get stocks by id', req.params);
  
    // RESTful 風格之下，鼓勵把這種過濾參數用 query string 來傳遞
    // /stocks/:stockId?page=1&year=2022
    // 會將前端網址取得的 query string 放在 req.query 物件內(下面)
    // req.query = {page:1,year:2022} <--存取在一個物件內

  
    // ============= 1. 取得目前在第幾頁，而且利用 || 這個特性來做預設值 =============
    // req.query = {}
    // 如果網址上沒有 page 這個 query string，那 req.query.page 會是 undefined
    // undefined 會是 false，所以 page 就被設定成 || 後面那個數字(就是1)
    // https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy
    // 因為是前端的請求所以使用req.query
  
    let page = req.query.page || 1;
    console.log('current page', page);
  
    // ============= 2. 取得目前的總筆數 =============
    let [allResults, fields] = await pool.execute(
      'SELECT * FROM stock_prices WHERE stock_id = ?',
      [req.params.stockId]
    );
    const total = allResults.length;
    console.log('total:', total);
  
    // ============= 3. 計算總共有幾頁=============
    // Math.ceil 1.1 => 2   1.05 -> 2 (無條件進位，未滿兩頁，也算兩頁)
    const perPage = 5; // 每一頁有幾筆
    // 取得總共有幾頁 = (全部筆數/一頁幾筆)<--無條件進位
    const lastPage = Math.ceil(total / perPage);
    console.log('lastPage:', lastPage);
  
    //  ============= 4. 計算 offset 是多少（計算要跳過幾筆）=============
    // 公式 : 總過跳過幾筆 = (目前頁數-1)*(每一頁有幾筆)
    // 在第5頁，就是要跳過 (5-1) * 5(每一頁有5筆) = 20(跳過20筆資料)
    let offset = (page - 1) * perPage;
    console.log('offset:', offset);
  
    // ============= 5. 取得這一頁的資料 select * from table limit ? offet ? =============
    // 取得這一頁的資料 = 跳過筆數，然後從跳過的筆數之後，拿幾筆出來
    let [pageResults] = await pool.execute(
      // ORDER BY date DESC <-按照日期正敘排序
      // LIMIT 每頁有幾筆 (perPage)
      // OFFSET 跳過筆數 (offset)
      'SELECT * FROM stock_prices WHERE stock_id = ? ORDER BY date DESC LIMIT ? OFFSET ?',
      [req.params.stockId, perPage, offset]
    );
  
    // test case:
    // 在網址上測試每個頁碼
    // http://localhost:3001/stocks/2330?page=13
    // 正面: 沒有page, page=1, page=2, ...page=12 (因為總共12頁)
    // 負面: page=-1, page=13, page=空白(page=1), page=a,...
  
    // ============= 6. 回覆給前端 =============
    res.json({
      // 用來儲存所有跟頁碼有關的資訊
      pagination: {
        //total=total
        total,
        lastPage,
        page,
      },
      // 真正的資料
      data: pageResults,
    });
  });

//-----------------------------------------------------
module.exports = router;
