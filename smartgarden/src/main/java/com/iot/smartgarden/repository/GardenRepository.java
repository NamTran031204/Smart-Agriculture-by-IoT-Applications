package com.iot.smartgarden.repository;

import com.iot.smartgarden.entity.Garden;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GardenRepository extends JpaRepository<Garden, Long> {

    List<Garden> findByUserId(Long userId);
}
