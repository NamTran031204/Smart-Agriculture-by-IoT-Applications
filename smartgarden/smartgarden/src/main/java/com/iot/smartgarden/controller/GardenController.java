package com.iot.smartgarden.controller;

import com.iot.smartgarden.config.MqttConfig;
import com.iot.smartgarden.entity.Device;
import com.iot.smartgarden.entity.SensorData;
import com.iot.smartgarden.repository.DeviceRepository;
import com.iot.smartgarden.repository.SensorDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")   
public class GardenController {

    @Autowired
    private SensorDataRepository sensorRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private MqttConfig.MqttGateway mqttGateway;

    // XEM DỮ LIỆU CẢM BIẾN
    @GetMapping("/sensors/latest")
    public SensorData getLatestData() {
        return sensorRepository.findAll(PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "id")))
                .stream().findFirst().orElse(null);
    }

    @GetMapping("/sensors/history")
    public List<SensorData> getHistory(@RequestParam Long from, @RequestParam Long to) {
        return sensorRepository.findByTimestampBetween(from, to);
    }

    // XEM TRẠNG THÁI THIẾT BỊ

    @GetMapping("/devices")
    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    // Gửi lệnh MQTT

    // API chung cho tất cả thiết bị: /api/control/pump, /api/control/fan...
    @PostMapping("/control/{deviceId}/{component}")
    public String controlDevice(
            @PathVariable String deviceId,
            @PathVariable String component,
            @RequestBody Map<String, String> body) {

        String state = body.get("state"); // "ON" hoặc "OFF"

        // 1. Gửi lệnh MQTT
        String topic = "garden/command/" + deviceId + "/" + component;
        mqttGateway.sendToMqtt(state, topic);

        // 2. CẬP NHẬT DATABASE NGAY LẬP TỨC
        // Tìm thiết bị trong DB, nếu chưa có thì tạo mới (để tránh lỗi null)
        // component chính là id thiết bị thật: 'pump', 'fan', 'light'
        Device device = deviceRepository.findById(component).orElse(new Device());
        device.setDeviceId(component);
        device.setState(state);
        device.setLastUpdated(LocalDateTime.now().toString());

        deviceRepository.save(device); // Lưu luôn trạng thái mới

        return "Sent " + state + " to " + component + " on device " + deviceId;
    }
}
