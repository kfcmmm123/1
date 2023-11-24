// yelp.js
import axios from "axios";

const yelp = axios.create({
  baseURL: "https://api.yelp.com/v3/businesses",
  headers: {
    accept: 'application/json',
    Authorization: "Bearer jVWqtVLfS5F0OxGkFIiNmWYn5miyZI1UxcHCg9Ypud4CjozIC5Vq-iM0UCqhDLEAgvBLadT2O41czbIz2bnK0a9DOzuvMbgoL8m82Ru_QG8-98uLx4bED_7HkFJgZXYx",
  },
});

export default yelp;
