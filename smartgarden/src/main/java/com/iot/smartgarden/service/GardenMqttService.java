package com.iot.smartgarden.service;

import com.iot.smartgarden.entity.Device;
import com.iot.smartgarden.entity.SensorData;
import com.iot.smartgarden.repository.DeviceRepository;
import com.iot.smartgarden.repository.SensorDataRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class GardenMqttService {

    @Autowired
    private SensorDataRepository sensorRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void handleIncomingMessage(String topic, String payload) {
        try {
            JsonNode json = objectMapper.readTree(payload);

            // 1. Xử lý Dữ liệu Cảm biến (Topic: garden/data/esp32-01/sensors)
            if (topic.contains("/sensors")) {
                SensorData data = new SensorData();
                // Khớp với key trong ESP32: doc["temp"], doc["humid"], doc["moisture"], doc["optical"]
                if (json.has("temp")) data.setTemp(json.get("temp").asDouble());
                if (json.has("humid")) data.setHumid(json.get("humid").asDouble());
                if (json.has("moisture")) data.setMoisture(json.get("moisture").asInt());
                if (json.has("optical")) data.setOptical(json.get("optical").asInt());

                // ESP32 gửi timestamp dạng ISO 8601 (2024-05-20T10:00:00Z)

                data.setTimestamp(System.currentTimeMillis() / 1000);

                sensorRepository.save(data);
                System.out.println(" Saved sensor data from topic: " + topic);
            }

            // 2. Xử lý Trạng thái Thiết bị (Topic: garden/state/esp32-01/pump)
            else if (topic.contains("garden/state/")) {

                String[] parts = topic.split("/");
                String deviceName = parts[parts.length - 1]; // pump, fan, light...


                String state = payload.trim();

                Device device = deviceRepository.findById(deviceName)
                        .orElse(new Device());
                device.setDeviceId(deviceName);
                device.setState(state);
                device.setLastUpdated(LocalDateTime.now().toString());
                deviceRepository.save(device);
                System.out.println(" Updated " + deviceName + " state to: " + state);
            }

            // 3. Xử lý Cảnh báo (Topic: garden/alert/esp32-01)
            else if (topic.contains("garden/alert/")) {
                System.out.println(" ALERT RECEIVED: " + payload);
                // Bạn có thể tạo thêm AlertEntity để lưu vào DB ở đây
            }

        } catch (Exception e) {
            System.err.println("Error parsing MQTT: " + e.getMessage());
        }
    }
}
