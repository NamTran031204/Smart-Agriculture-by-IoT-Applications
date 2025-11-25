package com.iot.smartgarden.repository;

import com.iot.smartgarden.entity.SensorData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {

    // Tìm dữ liệu trong khoảng thời gian (dùng cho vẽ biểu đồ)
    List<SensorData> findByTimestampBetween(Long from, Long to);
}