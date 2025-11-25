A. REST API (Dành cho Mobile App / Web Frontend)
Các API này chạy trên port mặc định: 8080. Base URL: http://<IP_MAY_TINH>:8080

1. Lấy dữ liệu Cảm biến (Sensor Data)
Lấy dữ liệu mới nhất

URL: GET /api/sensors/latest

Mô tả: Trả về bản ghi nhiệt độ, độ ẩm... mới nhất nhận được từ vườn.

Response:

JSON

{
    "id": 105,
    "temp": 26.5,
    "humid": 60.0,
    "moisture": 70,
    "optical": 1000,
    "timestamp": 1730042123
}
Lấy lịch sử dữ liệu (Vẽ biểu đồ)

URL: GET /api/sensors/history

Params:

from: (Long) Unix Timestamp bắt đầu.

to: (Long) Unix Timestamp kết thúc.

Ví dụ: /api/sensors/history?from=1730000000&to=1730090000

Response: Mảng JSON chứa danh sách các bản ghi như trên.

2. Quản lý Thiết bị (Devices)
Lấy danh sách trạng thái thiết bị

URL: GET /api/devices

Mô tả: Xem các thiết bị (Bơm, Đèn, Quạt) đang ON hay OFF.

Response:

JSON

[
    {
        "deviceId": "pump",
        "state": "OFF",
        "lastUpdated": "2025-11-25T23:45:00"
    },
    {
        "deviceId": "fan",
        "state": "ON",
        "lastUpdated": "2025-11-25T23:40:00"
    }
]
3. Điều khiển Thiết bị (Control)
Gửi lệnh Bật/Tắt

URL: POST /api/control/{deviceId}

Path Variable: {deviceId} là tên thiết bị (ví dụ: pump, fan, light).

Body:

JSON

{
    "state": "ON" 
}
(Hoặc "OFF")

Mô tả: Backend sẽ nhận lệnh này và bắn tín hiệu MQTT xuống ESP32.

B. MQTT TOPICS (Dành cho ESP32 / Hardware)
Broker chạy trên port: 1883.

1. ESP32 Gửi lên (Publish)
Dữ liệu cảm biến

Topic: garden/data

Format (JSON):

JSON

{
    "temp": 25.5,
    "humid": 60.2,
    "soil": 65,    
    "light": 300   
}
Tần suất: Khuyến nghị gửi 5s - 10s một lần hoặc khi có thay đổi lớn.

Phản hồi trạng thái (Feedback)

Topic: garden/state

Mục đích: Báo cáo lại cho server biết thiết bị đã thực sự bật/tắt thành công chưa.

Format:

JSON

{
    "device": "pump",
    "state": "ON"
}
2. ESP32 Lắng nghe (Subscribe)
Nhận lệnh điều khiển

Topic: garden/command/# (Hoặc cụ thể garden/command/pump, garden/command/fan...)

Format:

JSON

{
    "state": "ON"
}
Logic: Khi nhận được payload này tại topic tương ứng, ESP32 sẽ kích relay để bật/tắt thiết bị vật lý.

C. Database Schema (PostgreSQL)
Table: sensor_data
Column	Type	Description
id	BigInt (PK)	Tự tăng
temp	Double	Nhiệt độ
humid	Double	Độ ẩm không khí
moisture	Integer	Độ ẩm đất
optical	Integer	Cường độ sáng
timestamp	BigInt	Thời gian đo (Unix)



Table: devices
Column	Type	Description
device_id	Varchar (PK)	Mã thiết bị (pump, fan...)
state	Varchar	Trạng thái (ON/OFF)
last_updated	Varchar	Thời gian cập nhật cuối