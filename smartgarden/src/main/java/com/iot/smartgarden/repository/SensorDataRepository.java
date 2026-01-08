package com.iot.smartgarden.repository;

import com.iot.smartgarden.entity.SensorData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {

    List<SensorData> findByTimestampBetween(Long from, Long to);
}