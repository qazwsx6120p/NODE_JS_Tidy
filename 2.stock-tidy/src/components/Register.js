import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/config';

const Register = () => {
  // ---------------宣告使用者資訊的狀態---------------
  const [member, setMember] = useState({
    // 可以先寫預設值
    email: 'ashleylai58@gmail.com',
    name: 'ashley',
    password: 'testtest',
    confirmPassword: 'testtest',
    photo: '',
  });
  // -------------------input change事件-------------------
  function handleChange(e) {
    // member.email = e.target.value;(x 不能這樣寫)
    // 在 react 不可以直接去修改原本的 state 記憶體，
    // 要做一塊新的記憶體，並透過 setXXX 去修改
    setMember({ ...member, [e.target.name]: e.target.value });
  }

  // 抓取上傳圖片事件
  function handlePhoto(e) {
    // 陣列的索引0(因為只會上傳一張圖片)
    setMember({ ...member, photo: e.target.files[0] });
  }
// -------------------表單送出事件-------------------
  async function handleSubmit(e) {
    // 停掉預設行為
    e.preventDefault();
    try {
      // ----------axios.get(URL, params)----------
      // 參數1:網址 (傳送給後端的網址)
      // 參數2:網址後面?id...

      // ----------axios.post(URL, data, params) ----------
      // 參數1:網址 (傳送給後端的網址)
      // 參數2:資料
      // 參數3:網址後面?id...

      // ----------------方法1: 當你的表單沒有圖片的時候，可以直接傳輸 json 到後端去----------------
      // let response = await axios.post(`${API_URL}/auth/register`, member);
      // console.log(response.data);

      // 可以去網路 / Fetch/XHR / 404 / 酬載 <--查看資料有沒有送出

      // ----------------方法2: 如果表單有圖片，會用 FormData 的方式來上傳----------------
      let formData = new FormData();
      // 將name跟value傳去後端
      formData.append('email', member.email);
      formData.append('name', member.name);
      formData.append('password', member.password);
      formData.append('confirmPassword', member.confirmPassword);
      formData.append('photo', member.photo);
      
      //送去後端
      let response = axios.post(`${API_URL}/auth/register`, formData);
      console.log(response.data);

      // ------------抓取錯誤------------
    } catch (e) {
      //------------有錯誤，就顯示錯誤------------
      console.error(e);
    }
  }
  return (
    <form className="bg-purple-100 h-screen md:h-full md:my-20 md:mx-16 lg:mx-28 xl:mx-40 py-16 md:py-8 px-24 text-gray-800 md:shadow md:rounded flex flex-col md:justify-center">
      <h2 className="flex justify-center text-3xl mb-6 border-b-2 pb-2 border-gray-300">
        註冊帳戶
      </h2>
      <div className="mb-4 text-2xl">
        <label htmlFor="name" className="flex mb-2 w-32">
          Email
        </label>
        <input
          className="w-full border-2 border-purple-200 rounded-md h-10 focus:outline-none focus:border-purple-400 px-2"
          type="text"
          id="email"
          name="email"
          //先綁定植
          value={member.email}
          // onChange={(e)=>{
          //   setMember({...member,name:e.target.value})
          // }}
          // 統一寫在上面(比較好的寫法)
          onChange={handleChange}
        />
      </div>
      <div className="mb-4 text-2xl">
        <label htmlFor="name" className="flex mb-2 w-32">
          姓名
        </label>
        <input
          className="w-full border-2 border-purple-200 rounded-md h-10 focus:outline-none focus:border-purple-400 px-2"
          type="text"
          id="name"
          name="name"
          value={member.name}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4 text-2xl">
        <label htmlFor="password" className="flex mb-2 w-16">
          密碼
        </label>
        <input
          className="w-full border-2 border-purple-200 rounded-md h-10 focus:outline-none focus:border-purple-400 px-2"
          type="password"
          id="password"
          name="password"
          value={member.password}
          onChange={handleChange}
        />
      </div>
      <div className="mb-8 text-2xl">
        <label htmlFor="password" className="flex mb-2 w-32">
          確認密碼
        </label>
        <input
          className="w-full border-2 border-purple-200 rounded-md h-10 focus:outline-none focus:border-purple-400 px-2"
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={member.confirmPassword}
          onChange={handleChange}
        />
      </div>
      <div className="mb-8 text-2xl">
        <label htmlFor="photo" className="flex mb-2 w-32">
          圖片
        </label>
        <input
          className="w-full border-2 border-purple-200 rounded-md h-10 focus:outline-none focus:border-purple-400 px-2"
          type="file"
          id="photo"
          name="photo"
          onChange={handlePhoto}
        />
      </div>
      <button
        onClick={handleSubmit}
        className="text-xl bg-indigo-300 px-4 py-2.5 rounded hover:bg-indigo-400 transition duration-200 ease-in"
      >
        註冊
      </button>
    </form>
  );
};

export default Register;
