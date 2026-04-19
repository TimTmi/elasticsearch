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
  "size": 5,
  "query": {
    "multi_match": {
      "query": q,
      "type": "bool_prefix",
      "fields": ["name^3", "name._2gram^2", "name._3gram"]
    }
  }
}
```

- Query dùng bool_prefix để tối ưu autocomplete theo token prefix cuối
- Ranking ưu tiên:
1. match trực tiếp trên field name (boost 3)
2. match trên bigram/trigram từ search_as_you_type
- Không dùng fuzzy matching để tránh lệch kết quả khi input ngắn
- Thiết kế hướng UI typeahead, không phải full-text search semantic

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
