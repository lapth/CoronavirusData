# Bài viết
Source code này làm DEMO cho bài viết [Tạo ứng dụng điện thoại báo cáo tình trạng coronavirus trong vòng 2 ngày](https://medium.com/@lapth82/t%E1%BA%A1o-%E1%BB%A9ng-d%E1%BB%A5ng-%C4%91i%E1%BB%87n-tho%E1%BA%A1i-b%C3%A1o-c%C3%A1o-t%C3%ACnh-tr%E1%BA%A1ng-coronavirus-trong-v%C3%B2ng-2-ng%C3%A0y-588448ee2eea)

# Các nguồn dữ liệu
1. [Từ WHO](https://www.who.int/emergencies/diseases/novel-coronavirus-2019)
2. [Từ Bộ Y Tế](https://www.moh.gov.vn/web/guest/hoat-dong-cua-lanh-dao-bo/-/asset_publisher/vZJbYmQh1lGZ/content/phong-chong-benh-viem-uong-ho-hap-cap-do-virus-ncov-thong-tin-cap-nh-4)
3. [Từ Bộ Y Tế - Sức Khỏe Đời Sống](https://suckhoedoisong.vn/Virus-nCoV-cap-nhat-moi-nhat-lien-tuc-n168210.html)
4. [Kompa](https://corona-api.kompa.ai/graphql)

# Tải source code
PROJECT_FOLDER>git clone https://github.com/lapth/CoronavirusData.git

# Thư viện sử dụng:
1. Node: 10.x => Ở ứng dụng này, mình ép Node ở 10.x để tránh 1 số lỗi khi cần deploy ứng dụng này lên Serverless, môi trường mình ko config được gì.
2. express: dùng tạo RESTful service
3. node-schedule: dùng tạo bộ job scheduling
4. nodemailer: hỗ trợ gửi mail
5. node-fetch: load dữ liệu

# Cấu hình ứng dụng để chạy DEMO
Ứng dụng Back-End bạn nên chạy thử luôn trên server không cần phải thử ở local, để tránh những vấn đề không tương thích do bạn cấu hình trên local 1 đường, server cần một kiểu.
1. Cấu hình PORT default của Node. Trong trường hợp xài 1 số môi trường free, bạn không thể tùy biến khi chạy được nên bạn phải thay đổi thông số mặc định. Ở đây mình chọn 5454
2. Cấu hình mail server để gửi mail, nếu bạn ko muốn thì bỏ dòng lệnh tương ứng trong file MailHelper.js là được.
3. Cấu hình Ingress port 5454 cho GCP để ứng dụng có thể public ra ngoài mạng Internet ở port đó. Áp dụng cấu hình đó cho VM mình tạo cho dự án này hoặc đơn giản để Target = Apply to all

# Start server và chạy thử ứng dụng trên máy thực
Một số lệnh bạn cần biết:

Start node server:
```
PROJECT_HOME>npm start 
```

Start node server ở chế độ background, không bị tắt sau khi đóng console. Với lệnh này server sẻ log ra file nohup.out
```
PROJECT_HOME>nohup npm start &
```

Start node server ở chế độ background, không bị tắt sau khi close console và bỏ luôn log
```
PROJECT_HOME>nohup npm start >dev/null &
```

Sau khi bạn chạy server này, ứng dụng sẻ đi lấy dữ liệu mỗi 5 phút / lần và lưu vào file public/data/data.json

**File này được public ra ngoài cho ứng dụng client sử dụng.**

Bạn cần start quá trình crawl dữ liệu trước khi hoàn tất
```
http:\\IP:5454\start
```

Đến đây ứng dụng trên điện thoại của bạn đã có thể truy cập vào và lấy dữ liệu thực để hiển thị.

# Cải tiến
Do thời gian hạn chế, phần tổng hợp, phân tích dữ liệu còn sơ sài, để phần này tốt hơn chúng ta có thể bóc tách dữ liệu từ WHO và Bộ Y Tế. Để thực hiện phần này mình giới thiệu bạn 2 công nghệ:
1. Web Crawler: dùng để bóc tách dữ liệu từ web, thư viện mình hay xài là [JSDom](https://github.com/jsdom/jsdom) và [Puppeteer](https://github.com/puppeteer/puppeteer)
2. Để bóc tách dữ liệu từ file hình ảnh, file pdf ... một trong những thư viện bạn có thể sử dụng là [Tesseract](https://github.com/tesseract-ocr/tessdoc)

Để phần DEMO này tốt hơn cho cộng đồng mình welcome tất cả PRs (* _ *)

**Chúc bạn thành công!**