### 1\. Luồng Dữ liệu (ESP32 gửi lên Backend)

Gói tin này gộp tất cả dữ liệu cảm biến, được gửi định kỳ.

  * **Topic:** `garden/data/esp32-01/sensors`
  * **Payload (JSON):**
    ```json
    {
      "timestamp": "Number (Unix Timestamp)",
      "temp": "Number (Float, độ C)",
      "humid": "Number (Float, %)",
      "optical": "Number (Integer, Lux hoặc giá trị ADC)",
      "moisture": "Number (Integer, giá trị ADC)"
    }
    ```

-----

### 2\. Luồng Lệnh (Backend gửi xuống ESP32)

Các gói tin này được gửi khi người dùng thao tác trên Web/App.

**2.1. Máy bơm (Pump)**

  * **Topic:** `garden/command/esp32-01/pump`
  * **Payload (Text):**
      * `"ON"` (String)
      * `"OFF"` (String)

**2.2. Quạt gió (Fan)**

  * **Topic:** `garden/command/esp32-01/fan`
  * **Payload (Text):**
      * `"ON"` (String)
      * `"OFF"` (String)

**2.3. Đèn (Light)**

  * **Topic:** `garden/command/esp32-01/light`
  * **Payload (Text):**
      * `"ON"` (String)
      * `"OFF"` (String)

**2.4. Máy phun sương (Humidifier)**

  * **Topic:** `garden/command/esp32-01/humidifier`
  * **Payload (Text):**
      * `"ON"` (String)
      * `"OFF"` (String)

-----

### 3\. Luồng Trạng thái (ESP32 gửi lên Backend)

Gói tin này là phản hồi *ngay lập tức* từ ESP32 sau khi thực thi thành công một lệnh, dùng để cập nhật giao diện người dùng.

**3.1. Trạng thái Máy bơm (Pump)**

  * **Topic:** `garden/state/esp32-01/pump`
  * **Payload (Text):**
      * `"ON"` (String)
      * `"OFF"` (String)

**3.2. Trạng thái Quạt gió (Fan)**

  * **Topic:** `garden/state/esp32-01/fan`
  * **Payload (Text):**
      * `"ON"` (String)
      * `"OFF"` (String)

**3.3. Trạng thái Đèn (Light)**

  * **Topic:** `garden/state/esp32-01/light`
  * **Payload (Text):**
      * `"ON"` (String)
      * `"OFF"` (String)

**3.4. Trạng thái Máy phun sương (Humidifier)**

  * **Topic:** `garden/state/esp32-01/humidifier`
  * **Payload (Text):**
      * `"ON"` (String)
      * `"OFF"` (String)

-----

### 4\. Luồng Cảnh báo (ESP32 gửi lên Backend)

Gói tin này **chỉ được gửi khi** dữ liệu cảm biến vượt qua một ngưỡng đã định. Đây là một sự kiện không định kỳ.

  * **Topic:** `garden/alert/esp32-01`
  * **Payload (JSON):**
    ```json
    {
      "type": "String",
      "value": "Number (Float/Integer)",
      "message": "String"
    }
    ```

-----

### Chi tiết Payload

  * `type`: (String) Mã định danh cho loại cảnh báo.
  * `value`: (Number) Giá trị cảm biến thực tế đã gây ra cảnh báo.
  * `message`: (String) Một thông báo mô tả cảnh báo (dùng để hiển thị).

### Các loại Cảnh báo (Alert Types) đã định nghĩa

| `type` | `value` | `message` | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| **`HIGH_TEMP`** | (Float) Giá trị nhiệt độ | "Nhiet do qua cao\!" | Nhiệt độ không khí (từ DHT22) vượt ngưỡng cho phép (ví dụ: 35°C). |
| **`LOW_MOISTURE`**| (Integer) Giá trị ẩm đất | "Dat qua kho, can tuoi cay\!" | Độ ẩm đất (từ cảm biến) thấp hơn ngưỡng (ví dụ: \< 300). |
| **`HIGH_HUMIDITY`**| (Float) Giá trị độ ẩm | "Do am khong khi qua cao, nguy co nam moc\!" | Độ ẩm không khí (từ DHT22) cao hơn ngưỡng (ví dụ: \> 85%). |