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

            // TRƯỜNG HỢP 1: Nhận dữ liệu cảm biến
            if (topic.equals("garden/data")) {
                SensorData data = new SensorData();
                // JSON mẫu: {"temp": 26.5, "humid": 70, "soil": 65, "light": 300}
                if (json.has("temp")) data.setTemp(json.get("temp").asDouble());
                if (json.has("humid")) data.setHumid(json.get("humid").asDouble());
                if (json.has("soil")) data.setMoisture(json.get("soil").asInt());
                if (json.has("light")) data.setOptical(json.get("light").asInt());

                // Timestamp lấy hiện tại hoặc từ ESP gửi lên
                data.setTimestamp(System.currentTimeMillis() / 1000);

                sensorRepository.save(data);
                System.out.println("✅ Đã lưu sensor data: " + payload);
            }

            // TRƯỜNG HỢP 2: Nhận phản hồi trạng thái thiết bị
            else if (topic.equals("garden/state")) {
                // JSON mẫu: {"device": "pump", "state": "ON"}
                String deviceId = json.get("device").asText();
                String state = json.get("state").asText();

                Device device = deviceRepository.findById(deviceId)
                        .orElse(new Device(deviceId, "OFF", null));

                device.setState(state);
                device.setLastUpdated(LocalDateTime.now().toString());
                deviceRepository.save(device);
                System.out.println("🔄 Cập nhật trạng thái " + deviceId + ": " + state);
            }

        } catch (Exception e) {
            System.err.println("Lỗi parse MQTT: " + e.getMessage());
        }
    }
}
