package com.iot.smartgarden.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

@Getter
@Entity
@Table(name = "devices")
public class Device {

    @Id
    private String deviceId;

    private String state;

    private String lastUpdated;


    public Device() {
    }

    public Device(String deviceId, String state, String lastUpdated) {
        this.deviceId = deviceId;
        this.state = state;
        this.lastUpdated = lastUpdated;
    }



    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public void setState(String state) {
        this.state = state;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}