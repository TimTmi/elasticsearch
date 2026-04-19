# 23127395 - Trần Anh Khoa

## Web Demo
Web demo được host bằng Cloudflare:  
https://elasticsearch.tmitmi.workers.dev/

Database được host bằng:  
https://bonsai.io

---

# Kiến trúc hệ thống

```
Browser
   ↓
Cloudflare Worker API
   ↓
Elasticsearch (Bonsai)
```

Frontend gửi request đến `/api/search`.  
Worker nhận request và query Elasticsearch, sau đó trả về danh sách game phù hợp.

---

# Cấu trúc project

```
lab8/
├── public/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── seed/
│   ├── games.json
│   └── seed.js
├── worker.js
└── wrangler.toml
```

---

# app.js

Bao gồm:

- debounce để tránh gửi request liên tục khi người dùng đang gõ
- hủy request trước đó khi có search request mới
- query database thông qua `worker.js`
- typeahead: suggestion đầu tiên được hiển thị bằng **ghost text**, bấm **→** hoặc **Tab** để chấp nhận suggestion

---

# worker.js

- nhận request tại endpoint `/api/search`
- chỉ thực hiện query nếu query có **từ 2 ký tự trở lên**
- Elasticsearch query:

```json
{
  "size": 13,
  "query": {
    "bool": {
      "should": [
        {
          "prefix": {
            "name": {
              "value": "q",
              "boost": 5
            }
          }
        },
        {
          "multi_match": {
            "query": "q",
            "type": "bool_prefix",
            "fields": ["name^2", "name._2gram", "name._3gram"]
          }
        }
      ]
    }
  }
}
```

- Truy vấn autocomplete kết hợp prefix + bool_prefix
- prefix được boost mạnh để ép hành vi typeahead chính xác theo tiền tố
- bool_prefix dùng làm lớp fallback dựa trên ngram để bắt các trường hợp khớp một phần
- không dùng fuzziness để giữ kết quả ổn định khi người dùng gõ nhanh
- trả về tối đa 13 kết quả để render UI và tạo ghost text

---

seed.js:

```
mappings: {
  properties: {
    name: { type: "search_as_you_type" },
    genre: { type: "keyword" },
    year: { type: "integer" },
  },
}
```

- name có type 'search_as_you_type' để tối ưu autocomplete
