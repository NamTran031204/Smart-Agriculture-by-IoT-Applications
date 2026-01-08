package com.iot.smartgarden.service;

import com.iot.smartgarden.entity.Device;
import com.iot.smartgarden.entity.SensorData;
import com.iot.smartgarden.repository.DeviceRepository;
import com.iot.smartgarden.repository.SensorDataRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
public class GardenMqttService {

    @Autowired
    private SensorDataRepository sensorRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void handleIncomingMessage(String topic, String payload) {

        log.info("Đã nhận topic {} - {}", topic, payload);

        try {
            JsonNode json = objectMapper.readTree(payload);

            if (topic.contains("/sensors")) {
                SensorData data = new SensorData();
                if (json.has("temp")) data.setTemp(json.get("temp").asDouble());
                if (json.has("humid")) data.setHumid(json.get("humid").asDouble());
                if (json.has("moisture")) data.setMoisture(json.get("moisture").asInt());
                if (json.has("optical")) data.setOptical(json.get("optical").asInt());

                data.setTimestamp(System.currentTimeMillis() / 1000);

                sensorRepository.save(data);
                System.out.println(" Saved sensor data from topic: " + topic);
            }

            else if (topic.contains("garden/state/")) {

                String[] parts = topic.split("/");
                String deviceName = parts[parts.length - 1];


                String state = payload.trim();

                Device device = deviceRepository.findById(deviceName)
                        .orElse(new Device());
                device.setDeviceId(deviceName);
                device.setState(state);
                device.setLastUpdated(LocalDateTime.now().toString());
                deviceRepository.save(device);
                System.out.println(" Updated " + deviceName + " state to: " + state);
            }

            else if (topic.contains("garden/alert/")) {
                System.out.println(" ALERT RECEIVED: " + payload);
            }

        } catch (Exception e) {
            System.err.println("Error parsing MQTT: " + e.getMessage());
        }
    }
}
