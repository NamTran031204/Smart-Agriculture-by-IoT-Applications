# 🌿 Smart Garden IoT System

Hệ thống quản lý vườn thông minh sử dụng công nghệ IoT, cho phép giám sát môi trường và điều khiển thiết bị từ xa thông qua Web Dashboard.

## 🛠 Tech Stack

- **Frontend:** ReactJS (Vite), TailwindCSS, Axios, Chart.js.
- **Backend:** Java Spring Boot (Spring Security, JPA, MQTT Integration).
- **Database:** PostgreSQL.
- **Message Broker:** MQTT (Mosquitto/EMQX).
- **Hardware:** ESP32.

---

## 🚀 Hướng dẫn chạy (Installation)

### 1. Khởi chạy Infrastructure (Docker)
Chạy Database và MQTT Broker trước.

```bash
# Tại thư mục gốc của project
docker-compose up -d postgres mqtt
```

### 2. Khởi chạy Backend (Spring Boot)
* **Cấu hình:** Kiểm tra file `application.properties` để đảm bảo thông tin DB và MQTT khớp với Docker.
* **Chạy:** Mở project bằng IntelliJ IDEA -> Run `SmartgardenApplication.java`.
* **Tài khoản Admin mặc định:**
  * Username: `admin`
  * Password: `123`

### 3. Khởi chạy Frontend (ReactJS)
```bash
cd smart-garden-iot
npm install  # Cài đặt thư viện (chạy lần đầu)
npm run dev  # Chạy server development
```
Truy cập: `http://localhost:3000`

---

## 📡 API Documentation (REST)

**Base URL:** `http://localhost:8080`

**Authentication:**
Hệ thống sử dụng **JWT**. Trừ API Login/Register, tất cả request phải kèm Header:
> `Authorization: Bearer <YOUR_TOKEN>`

### 1. Authentication

| Method | Endpoint | Mô tả | Body Request |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/login` | Đăng nhập lấy Token | `{ "username": "admin", "password": "123" }` |
| `POST` | `/api/users/register` | Đăng ký tài khoản mới | `{ "username": "user1", "password": "123", "fullName": "Nguyen Van A" }` |

### 2. Sensor Data (Dữ liệu cảm biến)

#### Lấy dữ liệu mới nhất
* **URL:** `GET /api/sensors/latest`
* **Response:**
  ```json
  {
    "id": 105,
    "temp": 26.5,       
    "humid": 60.0,      
    "moisture": 70,    
    "optical": 1000,   
    "timestamp": 1730042123
  }
  ```

#### Lấy lịch sử (Vẽ biểu đồ)
* **URL:** `GET /api/sensors/history`
* **Params:**
  * `from`: Unix Timestamp bắt đầu.
  * `to`: Unix Timestamp kết thúc.
* **Ví dụ:** `/api/sensors/history?from=1730000000&to=1730090000`

### 3. Devices (Quản lý thiết bị)

#### Lấy danh sách thiết bị
* **URL:** `GET /api/devices`
* **Response:**
  ```json
  [
    {
      "deviceId": "pump",
      "name": "Máy bơm",
      "state": "OFF",
      "type": "pump",
      "lastUpdated": "2025-11-25T23:45:00"
    },
    {
      "deviceId": "fan",
      "name": "Quạt thông gió",
      "state": "ON",
      "type": "fan",
      "lastUpdated": "2025-11-25T23:40:00"
    }
  ]
  ```

#### Điều khiển thiết bị
* **URL:** `POST /api/control/{gatewayId}/{deviceId}`
* **Ví dụ:** `/api/control/esp32-01/pump`
* **Body:**
  ```json
  {
    "state": "ON" 
  }
  ```
  *(Giá trị: "ON" hoặc "OFF")*

---

## 🔌 MQTT Specification (Hardware)

**Broker Port:** `1883`

### 1. Publish (ESP32 gửi lên)
* **Topic:** `garden/data`
* **Payload:**
  ```json
  {
    "temp": 25.5,
    "humid": 60.2,
    "soil": 65,     
    "light": 300    
  }
  ```
* **Topic Feedback:** `garden/state` (Gửi xác nhận khi thiết bị đã bật/tắt thành công).

### 2. Subscribe (ESP32 nhận lệnh)
* **Topic:** `garden/command/#` (Ví dụ: `garden/command/pump`)
* **Payload:**
  ```json
  {
    "state": "ON"
  }
  ```

---

## 🗄 Database Schema (PostgreSQL)

### Users Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | BigInt | Primary Key |
| `username` | Varchar | Unique |
| `password` | Varchar | Encoded |
| `role` | Varchar | `ADMIN` / `USER` |

### Sensor_Data Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | BigInt | Primary Key |
| `temp` | Double | Nhiệt độ |
| `humid` | Double | Độ ẩm không khí |
| `moisture` | Integer | Độ ẩm đất |
| `optical` | Integer | Ánh sáng |
| `timestamp` | BigInt | Thời gian đo |

### Devices Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `device_id` | Varchar | ID thiết bị (pump, fan...) |
| `state` | Varchar | Trạng thái hiện tại |
| `last_updated` | Varchar | Thời gian cập nhật |
