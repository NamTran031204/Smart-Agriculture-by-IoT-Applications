package com.iot.smartgarden.controller;

import com.iot.smartgarden.config.MqttConfig;
import com.iot.smartgarden.dto.History;
import com.iot.smartgarden.entity.Device;
import com.iot.smartgarden.entity.SensorData;
import com.iot.smartgarden.repository.DeviceRepository;
import com.iot.smartgarden.repository.SensorDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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

    @PostMapping("/sensors/history")
    public List<SensorData> getHistory(@RequestBody History input) {
        return sensorRepository.findByTimestampBetween(input.getFrom(), input.getTo());
    }

    // XEM TRẠNG THÁI THIẾT BỊ

    @GetMapping("/devices")
    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    // Gửi lệnh MQTT

    @PostMapping("/control/{deviceId}/{component}")
    public String controlDevice(
            @PathVariable String deviceId,
            @PathVariable String component,
            @RequestBody Map<String, String> body) {

        String state = body.get("state");
        String topic = "garden/command/" + deviceId + "/" + component;

        mqttGateway.sendToMqtt(state, topic);

        Device deviceOptional = deviceRepository.findById(deviceId)
                .orElse(null);

        if (deviceOptional != null) {
            deviceOptional.setState(state);
            deviceRepository.save(deviceOptional);
        }

        return "Sent " + state + " to " + component + " on device " + deviceId;
    }
}
